(async () => {

    const fs = require('fs');
    const readline = require('readline');

    let page = 1;
    let limit = 200;

    const rs = fs.createReadStream('flyers_data.csv');
    const rl = readline.createInterface({ input: rs });

    // var today = new Date();
    var today = new Date('2019-05-30');

    let from = (page - 1) * limit + 1;
    let to = from + limit;

    var first = true;

    const parse = (line) => {
        var id, title, start, end, published, retailer, category;
        [id, title, start, end, published, retailer, category] = line.split(',');
        const s = new Date(start);
        const e = new Date(end);
        if (s.valueOf() == NaN) {
            console.log('Start date invalid for the line: ' + line)
            return NaN;
        }
        if (e.valueOf() == NaN) {
            console.log('End date invalid for the line: ' + line)
            return NaN;
        }
        if (!id) {
            console.log('Id invalid for the line: ' + line)
            return NaN;
        }
        if (!title) {
            console.log('Title invalid for the line: ' + line)
            return NaN;
        }
        if (!retailer) {
            console.log('Retailer invalid for the line: ' + line)
            return NaN;
        }
        if (!category) {
            console.log('Category invalid for the line: ' + line)
            return NaN;
        }
        if (!published) {
            console.log('Is published field invalid for the line: ' + line)
            return NaN;
        }
        if (today >=s && today <= e && published == 1) {
            return [id, title, retailer, category];
        }
        
        return NaN;
    }

    console.time(__filename);
    let i = 1
    var out = []
	for await (const line of rl) {
        if (first) {
            first = false;
            continue;
        }
        try {
            parsed = parse(line); 
            if (parsed.length === 4) {
                if (i >= from && i < to) {
                    console.log('parsed', parsed);
                    [id, title, retailer, category] = parsed;
                    out.push({
                        id: id,
                        title: title, 
                        retailer: retailer, 
                        category: category
                    });
                }
                i++;
            }  
        } catch(error) {
            console.error(error);
        }

    }
    console.log(JSON.stringify(out));
    console.log(out.length);
	console.timeEnd(__filename);
})().catch(error => console.log(error));