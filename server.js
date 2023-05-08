//для работы на сервере нужно установить пакет pm2


const TelegrammBot = require('node-telegram-bot-api');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const bot = new TelegrammBot(process.env.telegrammToken, { polling: true });
const webAppUrl = 'https://resilient-panda-03edd5.netlify.app';

const app = express();


app.use(express.json());
app.use(cors());

app.post('/web-data', async (req, res) => {
    const { queryId, products, totalPrice } = req.body;
    console.log(products);
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: `Поздравляем с успешной покупкой. Вы приобрели товар на сумму: ${totalPrice}`,
            }

        });
        return res.status(200).json({});

    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не удалось совершить покупку',
            input_message_content: {
                message_text: `Не удалось совершить покупку`,
            }
        })
        return res.status(500).json({});
    }

});


bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {

        await bot.sendMessage(chatId, 'Ниже появиться кнопка, заполни форму', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Заполнить форму', web_app: { url: webAppUrl + '/form' } }]
                ]
            }
        });


        await bot.sendMessage(chatId, 'Зайди в наш магазин', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'ProductList', web_app: { url: webAppUrl } }]
                ]
            },
        });
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);
            console.log(data);
            await bot.sendMessage(chatId, 'Спасибо что заполнили форму');
            await bot.sendMessage(chatId, 'Ваша страна' + data?.country);
            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю информацию вы получите в чате' + data?.street);
            }, 3000);
        } catch (e) {
            console.log(e);
        }
    }

    bot.sendMessage(chatId, 'Received your message');
});

app.listen(process.env.PORT, () => console.log('server running... PORT = ' + process.env.PORT));