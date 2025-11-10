import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    outputDir: path.resolve(__dirname, './mygraphs.github.io'),
    devServer: {
        allowedHosts: 'all',
        host: '0.0.0.0',
        https: false,
    },
}
