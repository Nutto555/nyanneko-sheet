.PHONY: install dev build preview lint seed clean

## Install dependencies
install:
	npm install

## Install dependencies and start development server
dev: install
	npm run dev

## Production build
build:
	npm run build

## Preview production build
preview:
	npm run preview

## Run ESLint
lint:
	npm run lint

## Seed database
seed:
	npm run seed

## Remove build artifacts and node_modules
clean:
	rm -rf dist node_modules
