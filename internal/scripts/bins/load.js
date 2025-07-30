const bin = import.meta.resolve('@biomejs/biome/bin/biome');
process.argv.splice(1, 2, bin, 'check');
await import(bin);
