
import { createLowlight, common } from 'lowlight'

const markdown = `
# Hello World

Here is some code:

\`\`\`javascript
console.log('hello world')
const x = 10;
function test() {
    return x * 2;
}
\`\`\`

\`\`\`python
def foo():
    print("bar")
\`\`\`

\`\`\`rust
fn main() {
    println!("Hello, world!");
}
\`\`\`
`

// Generate a large markdown to simulate a real blog post
const largeMarkdown = markdown.repeat(100)

async function benchmark() {
    console.log('Starting benchmark...')
    const start = performance.now()

    // Create processor
    const lowlight = createLowlight(common)

    const initTime = performance.now()
    console.log(`Initialization took: ${(initTime - start).toFixed(2)}ms`)

    // Reset timer to measure processing
    const processStart = performance.now()

    // Lowlight highlightAuto or highlight loops
    // In rehype-highlight it visits nodes and calls highlight
    // We simulate this by checking highlight speed for some blocks

    const codeBlocks = [
        { lang: 'javascript', code: "console.log('hello world')" },
        { lang: 'python', code: "def foo(): print('bar')" },
        { lang: 'rust', code: "fn main() { println!('Hello'); }" }
    ]

    // Simulate 1000 code blocks (heavy post)
    for (let i = 0; i < 1000; i++) {
        const block = codeBlocks[i % 3]
        lowlight.highlight(block.lang, block.code)
    }

    const end = performance.now()

    console.log(`Processing 1000 code blocks took: ${(end - processStart).toFixed(2)}ms`)
    console.log(`Total took: ${(end - start).toFixed(2)}ms`)
}

benchmark()
