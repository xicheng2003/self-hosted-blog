
import { createLowlight, common } from 'lowlight'

async function benchmark() {
    console.log('Starting highlightAuto benchmark...')
    const start = performance.now()

    // Create processor
    const lowlight = createLowlight(common)

    const initTime = performance.now()
    console.log(`Initialization took: ${(initTime - start).toFixed(2)}ms`)

    // Reset timer to measure processing
    const processStart = performance.now()

    const code = `
    function test() {
        console.log("Hello world");
        return 1 + 2;
    }
    `

    // Simulate 100 code blocks with auto-detection (no language specified)
    // This forces checking against all 37 common languages
    for (let i = 0; i < 100; i++) {
        lowlight.highlightAuto(code)
    }

    const end = performance.now()

    console.log(`Processing 100 highlightAuto blocks took: ${(end - processStart).toFixed(2)}ms`)
}

benchmark()
