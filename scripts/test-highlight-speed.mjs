
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'

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

async function benchmark() {
    console.log('Starting benchmark...')
    const start = performance.now()

    // Create processor (this includes initialization of plugins)
    const processor = unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)

    const initTime = performance.now()
    console.log(`Initialization took: ${(initTime - start).toFixed(2)}ms`)

    // Reset timer to measure processing
    const processStart = performance.now()
    await processor.process(markdown)
    const end = performance.now()

    console.log(`Processing took: ${(end - processStart).toFixed(2)}ms`)
    console.log(`Total took: ${(end - start).toFixed(2)}ms`)
}

benchmark()
