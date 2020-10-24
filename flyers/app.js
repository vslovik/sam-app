// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const fs = require('fs')
const readline = require('readline');

const FILENAME = 'flyers_data.csv';
const DEFAULT_LIMIT = 100;

let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    try {

        const page = (event.queryStringParameters && event.queryStringParameters.page) ? event.queryStringParameters.page : 1;
        const limit = (event.queryStringParameters && event.queryStringParameters.limit) ? event.queryStringParameters.limit : DEFAULT_LIMIT;

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

            // var today = new Date();
            var today = new Date('2019-05-30'); //ToDo: remove when have the fresh data

            if (today >=s && today <= e && published == 1) {
                return [id, title, retailer, category];
            }
            
            return NaN;
        }
    
        const rs = fs.createReadStream(FILENAME);
        const rl = readline.createInterface({ input: rs });

        let from = (page - 1) * limit + 1;
        let to = from + limit;
    
        var first = true;

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
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'OK',
                data: JSON.stringify(out)
            })
        }
    } catch (err) {
        console.log(err);
        response = {
            'statusCode': 500,
            'body': JSON.stringify({
                message: 'Error' + err,
            })
        }
    }

    return response
};
