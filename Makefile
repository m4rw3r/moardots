BIN     ?= $(shell npm bin)
SOURCES := $(wildcard src/*.js) $(wildcard src/**/*.js)

all: dist/index.js

dist/index.js: $(SOURCES)
	node rollup.js

.PHONY: clean
clean:
	rm -rf dist

.PHONY: test
test:
	$(BIN)/tap -Rspec tests/*.test.js

.PHONY: flow
flow:
	$(BIN)/flow check .

.PHONY: watch
watch:
	$(BIN)/nodemon -w src -w tests --exec 'make flow test || exit 1'
