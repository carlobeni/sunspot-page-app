const fs = require('fs');
const path = 'C:\\Users\\Carlos Benitez\\.gemini\\antigravity\\brain\\86ba9c94-c74d-4bdf-950e-a5921e61c91f\\.system_generated\\logs\\overview.txt';
const data = fs.readFileSync(path, 'utf8');
const lines = data.split('\n');

lines.forEach((line, i) => {
  if (!line.trim()) return;
  try {
    const json = JSON.parse(line);
    if (json.tool_calls) {
      json.tool_calls.forEach(tc => {
        if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
          console.log(`--- Step ${json.step_index} (${json.created_at}) ---`);
          if (tc.args.ReplacementContent) {
            if (tc.args.ReplacementContent.includes('DMD')) {
               console.log(tc.args.ReplacementContent);
            }
          }
          if (tc.args.ReplacementChunks) {
            const chunks = JSON.parse(tc.args.ReplacementChunks);
            chunks.forEach(c => {
               if (c.ReplacementContent.includes('DMD')) {
                  console.log(c.ReplacementContent);
               }
            });
          }
        }
      });
    }
  } catch (e) {
    // console.error(`Error parsing line ${i}:`, e.message);
  }
});
