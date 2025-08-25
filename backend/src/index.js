import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import crypto from 'crypto';
import cors from 'cors';

const { Pool } = pg;

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// PostgreSQL pool configuration
const pool = new Pool({
	user: process.env.DB_USER || 'user',
	host: process.env.DB_HOST || 'localhost',
	database: process.env.DB_DATABASE || 'processes_db',
	password: process.env.DB_PASSWORD || 'password',
	port: process.env.DB_PORT || 5432,
});

// Function to generate SHA-256 hash
const generateHash = (data) => {
	const hash = crypto.createHash('sha256');
	hash.update(JSON.stringify(data));
	return hash.digest('hex');
};

// GET: All processes
app.get('/api/processes', async (req, res) => {
	try {
		const { rows } = await pool.query(
			'SELECT * FROM processes ORDER BY created_at DESC'
		);
		res.json(rows);
	} catch (error) {
		console.error('Error fetching processes:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// GET: Process history by ID
app.get('/api/processes/:id/history', async (req, res) => {
	try {
		const { id } = req.params;
		const { rows } = await pool.query(
			'SELECT * FROM process_history WHERE process_id = $1 ORDER BY timestamp DESC',
			[id]
		);
		res.json(rows);
	} catch (error) {
		console.error('Error fetching history:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// POST: Create a new process
app.post('/api/processes', async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');

		const { name, description } = req.body;
		const { rows } = await client.query(
			'INSERT INTO processes(name, description) VALUES($1, $2) RETURNING *',
			[name, description]
		);
		const newProcess = rows[0];
		const processId = newProcess.id;

		// Get previous hash (if any)
		const lastHistory = await client.query(
			'SELECT current_hash FROM process_history WHERE process_id = $1 ORDER BY timestamp DESC LIMIT 1',
			[processId]
		);
		const previousHash =
			lastHistory.rows.length > 0 ? lastHistory.rows[0].current_hash : '0';

		// Create current hash
		const dataToHash = {
			processId,
			action: 'create',
			name,
			description,
			previousHash,
			timestamp: new Date().toISOString(),
		};
		const currentHash = generateHash(dataToHash);

		// Insert history record
		await client.query(
			'INSERT INTO process_history(process_id, action, change_data, previous_hash, current_hash) VALUES($1, $2, $3, $4, $5)',
			[processId, 'create', dataToHash, previousHash, currentHash]
		);

		await client.query('COMMIT');
		res.status(201).json(newProcess);
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Error creating process:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	} finally {
		client.release();
	}
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
	console.error('Uncaught Exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
	if (err) {
		console.error('Database connection error:', err);
	} else {
		console.log('Database connected successfully');
	}
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
