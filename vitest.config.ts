import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['testsets/**/queries/*.json'],
        setupFiles: './vitest.setup.ts',
    },
});
