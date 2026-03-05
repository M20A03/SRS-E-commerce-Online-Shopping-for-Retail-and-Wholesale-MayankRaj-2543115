import fs from 'fs';
import axios from 'axios';
import google from 'googlethis';

async function downloadImage(query, filename) {
    try {
        console.log(`Searching for: ${query}`);
        const images = await google.image(query, { safe: false });
        if (images && images.length > 0) {

            // Try up to 3 images if the first fails
            for (let i = 0; i < Math.min(3, images.length); i++) {
                try {
                    console.log(`Attempting to download: ${images[i].url}`);
                    const response = await axios({
                        url: images[i].url,
                        method: 'GET',
                        responseType: 'stream',
                        timeout: 10000
                    });

                    const path = `public/products/${filename}.jpg`;
                    const writer = fs.createWriteStream(path);
                    response.data.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });

                    console.log(`✅ Successfully saved: ${path}`);
                    return true;
                } catch (error) {
                    console.log(`Failed to download ${images[i].url}: ${error.message}, trying next...`);
                }
            }
        }
    } catch (err) {
        console.error(`❌ Failed: ${query}`, err.message);
    }
    return false;
}

async function run() {
    if (!fs.existsSync('public/products')) {
        if (!fs.existsSync('public')) fs.mkdirSync('public');
        fs.mkdirSync('public/products');
    }

    const tasks = [
        { q: 'Saloni Mustard oil 1L bottle high quality product', id: 'o1' },
        { q: 'Saavli Refined oil 1L pouch high quality', id: 'o2' },
        { q: 'Mahakosh Soyabean oil 1L pouch', id: 'o3' },
        { q: 'Rajdhani Groundnut oil 1L bottle', id: 'o4' },
        { q: 'Doctor Detergent Powder packet', id: 'd1' },
        { q: 'Doctor Liquid Detergent bottle', id: 'd2' },
        { q: 'Meri Chai Akshay tea packet', id: 't1' },
        { q: 'Meri Chai premium tea packet', id: 't2' },
        { q: 'Premium Sandalwood Agarbatti box pure', id: 'a1' },
        { q: 'Rose Jasmine Agarbatti combo box', id: 'a2' },
        { q: 'Ruchi Gold Refined Palmolein oil 1L pouch', id: 'oth1' },
        { q: 'Ruchi Nutrela Soya Chunks box', id: 'oth2' }
    ];

    for (const task of tasks) {
        await downloadImage(task.q, task.id);
        // Add a delay to prevent rate-limiting
        await new Promise(r => setTimeout(r, 1500));
    }

    console.log('✅ All downloads completed.');
}

run();
