develop:
	npx webpack-dev-server

install:
	npm install

publish:
	npm publish --dry-run

build:
	rm -rf dist
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .

.PHONY: test
