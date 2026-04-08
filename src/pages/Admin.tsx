import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router';
import type { Character, TeamWithMembers } from '../types/database';
import {
  getAllCharacters, getAllTeams,
  createTeam, updateTeam, deleteTeam,
  addTeamMember, removeTeamMember,
} from '../services/admin';

const CATEGORIES = [
  { value: 'attack', label: 'Attack' },
  { value: 'defense_phy', label: 'Defense Phy' },
  { value: 'defense_mage', label: 'Defense Mage' },
  { value: 'defense_tank', label: 'Defense Tank' },
  { value: 'defense_hybrid', label: 'Defense Hybrid' },
] as const;

// ─── Team Editor ─────────────────────────────────────────────────────────────

function TeamEditor({
  team,
  onSave,
  onDelete,
  onCancel,
}: {
  team: TeamWithMembers | null;
  onSave: () => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(team?.name || '');
  const [category, setCategory] = useState(team?.category || 'defense_phy');
  const [speedReq, setSpeedReq] = useState(team?.speed_requirement || '');
  const [strategyNotes, setStrategyNotes] = useState(team?.strategy_notes || '');
  const [description, setDescription] = useState(team?.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
      if (team) {
        await updateTeam(team.id, {
          name, category,
          speed_requirement: speedReq || null,
          strategy_notes: strategyNotes || null,
          description: description || null,
        });
      } else {
        await createTeam({
          name, slug, category,
          speed_requirement: speedReq || undefined,
          strategy_notes: strategyNotes || undefined,
          description: description || undefined,
        });
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 space-y-3">
      <h3 className="text-sm font-bold text-white">{team ? 'Edit Team' : 'New Team'}</h3>

      <input type="text" placeholder="Team name" value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 rounded text-sm bg-slate-800 border border-slate-700 text-white" />

      <select value={category} onChange={(e) => setCategory(e.target.value)}
        className="w-full px-3 py-2 rounded text-sm bg-slate-800 border border-slate-700 text-white">
        {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>

      <input type="text" placeholder="Speed requirement (e.g. 270++)" value={speedReq}
        onChange={(e) => setSpeedReq(e.target.value)}
        className="w-full px-3 py-2 rounded text-sm bg-slate-800 border border-slate-700 text-white" />

      <textarea placeholder="Strategy notes (skill order, speed order...)" value={strategyNotes}
        onChange={(e) => setStrategyNotes(e.target.value)} rows={3}
        className="w-full px-3 py-2 rounded text-sm bg-slate-800 border border-slate-700 text-white resize-y" />

      <textarea placeholder="Description" value={description}
        onChange={(e) => setDescription(e.target.value)} rows={2}
        className="w-full px-3 py-2 rounded text-sm bg-slate-800 border border-slate-700 text-white resize-y" />

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="px-3 py-1.5 rounded text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onCancel}
          className="px-3 py-1.5 rounded text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white">
          Cancel
        </button>
        {team && onDelete && (
          <button onClick={onDelete}
            className="px-3 py-1.5 rounded text-xs font-medium bg-red-800 hover:bg-red-700 text-white ml-auto">
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Member Editor ───────────────────────────────────────────────────────────

function MemberEditor({
  team, characters, onRefresh,
}: {
  team: TeamWithMembers;
  characters: Character[];
  onRefresh: () => void;
}) {
  const [addingChar, setAddingChar] = useState('');
  const [addingPos, setAddingPos] = useState(0);
  const [addingGear, setAddingGear] = useState('');
  const [error, setError] = useState('');

  const members = [...(team.team_members || [])].sort((a, b) => a.position - b.position);

  async function handleAdd() {
    if (!addingChar) return;
    setError('');
    try {
      await addTeamMember(team.id, addingChar, addingPos, addingGear || undefined);
      setAddingChar('');
      setAddingPos(members.length);
      setAddingGear('');
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add failed');
    }
  }

  async function handleRemove(memberId: string) {
    try {
      await removeTeamMember(memberId);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed');
    }
  }

  return (
    <div className="mt-3 p-3 rounded border border-slate-700/50 bg-slate-900/30 space-y-2">
      <h4 className="text-xs font-bold text-slate-400 uppercase">Members ({members.length})</h4>

      {members.map((m) => {
        const char = m.characters as Character | undefined;
        return (
          <div key={m.id} className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-5 text-center text-slate-500">{m.position}</span>
            {char?.image_url && (
              <img src={char.image_url} alt="" className="w-8 h-8 rounded object-cover" />
            )}
            <span className="flex-1">
              {char?.name_en || 'Unknown'}
              {char?.name_th && <span className="text-slate-500 ml-1">({char.name_th})</span>}
            </span>
            <span className="text-slate-500 truncate max-w-32">{m.gear_notes?.slice(0, 40)}</span>
            <button onClick={() => handleRemove(m.id)}
              className="text-red-400 hover:text-red-300 px-1">x</button>
          </div>
        );
      })}

      <div className="flex gap-2 items-end pt-2 border-t border-slate-700/50">
        <div className="flex-1">
          <label className="text-[10px] text-slate-500 block mb-0.5">Character</label>
          <select value={addingChar} onChange={(e) => setAddingChar(e.target.value)}
            className="w-full px-2 py-1.5 rounded text-xs bg-slate-800 border border-slate-700 text-white">
            <option value="">Select...</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name_en} ({c.name_th})</option>
            ))}
          </select>
        </div>
        <div className="w-16">
          <label className="text-[10px] text-slate-500 block mb-0.5">Pos</label>
          <input type="number" value={addingPos} onChange={(e) => setAddingPos(Number(e.target.value))}
            className="w-full px-2 py-1.5 rounded text-xs bg-slate-800 border border-slate-700 text-white" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-slate-500 block mb-0.5">Gear notes (JSON)</label>
          <input type="text" value={addingGear} onChange={(e) => setAddingGear(e.target.value)}
            placeholder='{"stat_primary":"ATK%"}'
            className="w-full px-2 py-1.5 rounded text-xs bg-slate-800 border border-slate-700 text-white" />
        </div>
        <button onClick={handleAdd}
          className="px-2 py-1.5 rounded text-xs font-medium bg-green-700 hover:bg-green-600 text-white whitespace-nowrap">
          + Add
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────

export default function Admin() {
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [editingTeam, setEditingTeam] = useState<TeamWithMembers | null | 'new'>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [t, c] = await Promise.all([getAllTeams(), getAllCharacters()]);
      setTeams(t);
      setCharacters(c);
    } catch {
      // data may not be available yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = filterCategory
    ? teams.filter((t) => t.category === filterCategory)
    : teams;

  async function handleDeleteTeam(id: string) {
    if (!confirm('Delete this team and all its members?')) return;
    await deleteTeam(id);
    setEditingTeam(null);
    await refresh();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage teams and formations</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/strategies"
            className="px-3 py-1.5 rounded text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white"
          >
            Strategy Builder
          </Link>
          <Link
            to="/admin/templates"
            className="px-3 py-1.5 rounded text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white"
          >
            Template Manager
          </Link>
          <button onClick={() => setEditingTeam('new')}
            className="px-3 py-1.5 rounded text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white">
            + New Team
          </button>
        </div>
      </div>

      {/* New team editor */}
      {editingTeam === 'new' && (
        <div className="mb-6">
          <TeamEditor
            team={null}
            onSave={async () => { setEditingTeam(null); await refresh(); }}
            onCancel={() => setEditingTeam(null)}
          />
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilterCategory('')}
          className={`px-2.5 py-1 rounded text-xs ${!filterCategory ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
          All ({teams.length})
        </button>
        {CATEGORIES.map((c) => {
          const count = teams.filter((t) => t.category === c.value).length;
          return (
            <button key={c.value} onClick={() => setFilterCategory(c.value)}
              className={`px-2.5 py-1 rounded text-xs ${filterCategory === c.value ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {c.label} ({count})
            </button>
          );
        })}
      </div>

      {loading && <p className="text-slate-500 text-xs mb-4">Loading...</p>}

      {/* Team list */}
      <div className="space-y-3">
        {filtered.map((team) => (
          <div key={team.id} className="rounded-lg border border-slate-700 bg-slate-800/30 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-800/50"
              onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                {team.category.replace('defense_', 'def/')}
              </span>
              <span className="flex-1 text-sm text-white font-medium truncate">{team.name}</span>
              <span className="text-xs text-slate-500">{team.team_members?.length || 0} members</span>
              {team.speed_requirement && (
                <span className="text-xs text-amber-400">{team.speed_requirement}</span>
              )}
              <button onClick={(e) => { e.stopPropagation(); setEditingTeam(team); setExpandedTeam(team.id); }}
                className="text-xs text-slate-400 hover:text-white px-1">edit</button>
              <span className="text-slate-600">{expandedTeam === team.id ? '▾' : '▸'}</span>
            </div>

            {expandedTeam === team.id && (
              <div className="px-4 pb-4 border-t border-slate-700/50">
                {editingTeam && typeof editingTeam === 'object' && editingTeam.id === team.id && (
                  <div className="mt-3">
                    <TeamEditor
                      team={team}
                      onSave={async () => { setEditingTeam(null); await refresh(); }}
                      onDelete={() => handleDeleteTeam(team.id)}
                      onCancel={() => setEditingTeam(null)}
                    />
                  </div>
                )}
                <MemberEditor team={team} characters={characters} onRefresh={refresh} />
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-500 text-sm">
          No teams found. Click "+ New Team" to create one.
        </div>
      )}
    </div>
  );
}
