// 使用node-fetch库来发起HTTP请求。Netlify Functions支持此库。
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // 只接受POST请求
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 1. 从前端发来的请求中解析出 click_id
    const body = JSON.parse(event.body);
    const clickId = body.taboola_click_id;

    if (!clickId) {
      return { statusCode: 400, body: 'Missing click_id' };
    }

    // 2. 定义我们在Taboola后台设置的事件名称 ("暗号")
    const eventName = 's2s_purchase_click'; 

    // 3. 构建要发送给Taboola的Postback URL
    const taboolaUrl = `https://trc.taboola.com/actions-handler/log/3/s2s-action?click-id=${clickId}&name=${eventName}`;

    // 4. 我们的服务器向Taboola的服务器发起请求
    const taboolaResponse = await fetch(taboolaUrl);

    // 5. 检查Taboola的响应
    if (!taboolaResponse.ok) {
      // 如果Taboola返回错误，我们在日志中记录下来
      console.error(`Taboola S2S Error: ${taboolaResponse.statusText}`);
      // 即使失败，也告诉前端我们已处理
      return { statusCode: 200, body: 'Request sent to Taboola, but received an error.' };
    }

    console.log(`Successfully sent S2S event for click_id: ${clickId}`);

    // 6. 向前端返回成功信息
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'S2S event successfully sent to Taboola' }),
    };

  } catch (error) {
    console.error('Internal S2S function error:', error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};