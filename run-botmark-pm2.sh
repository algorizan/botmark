pm2 start index.js --name botmark --log ./botmark_logs.txt --wait-ready --listen-timeout 10000 --max-memory-restart 200M --kill-timeout 3000 && pm2 monit
