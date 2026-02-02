require('dotenv').config(); // .envファイルから設定を読み込む

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors()); // フロントエンドからのアクセスを許可
app.use(express.json()); // JSON形式のデータを受け取れるようにする

// .envファイルに記載した GAS_URL を取得
const GAS_URL = process.env.GAS_URL;

app.post('/send-to-gas', async (req, res) => {
    console.log("📩 フロントエンドからデータを受信しました:", req.body);

    try {
        // GASへデータを転送（JSON形式でそのまま送ります）
        const response = await axios.post(GAS_URL, req.body, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("✅ GAS（スプレッドシート）への転送に成功しました！");
        res.status(200).json({ message: "Success!", detail: response.data });

    } catch (error) {
        // GAS特有のリダイレクト（302）が発生しても、axiosがエラーを吐く場合があるためのケア
        if (error.response && error.response.status === 302) {
            console.log("⚠️ GASリダイレクトを検出しましたが、送信は完了している可能性があります。");
            return res.status(200).json({ message: "Success (Redirected)" });
        }

        console.error("❌ 転送エラー:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ポート番号の設定（環境変数になければ3000を使用）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    if (!GAS_URL) {
        console.error("⚠️ 警告: .envファイルに GAS_URL が設定されていないようです。");
    }
});