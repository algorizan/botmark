/* eslint-disable camelcase */
/* eslint-disable strict */
module.exports = {
	apps: [{
		name: "botmark",
		script: "./index.js",
		cwd: ".",
		max_memory_restart: "200M",
		error_file: "./botmark_logs.txt",
		out_file: "./botmark_logs.txt",
		wait_ready: true,
		listen_timeout: 10000,
		kill_timeout: 3000,
		instances: "max",
		env: {
			NODE_ENV: "development",
			PROCESS_ID: "botmark",
			CLIENT_ID: "911410913138081863",
		},
		env_production: {
			NODE_ENV: "production",
			PROCESS_ID: "botmark",
			CLIENT_ID: "911410913138081863",
		}
	}]
};
