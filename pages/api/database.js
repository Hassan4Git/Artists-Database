import { createPool } from "mysql2"

export default async function handler(req, res) {
	const { id, artist, rate, streams, paid } = req.body
	const { delId } = req.query
	const pool = createPool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB,
		connectionLimit: 5,
	})

	const handleDbError = (err) => {
		res.status(500).json({ error: err.message })
		pool.end()
	}

	const handleDbSuccess = (rows) => {
		res.status(200).json(rows ? rows : {success: true})
		pool.end()
	}

	switch (req.method) {
		case 'POST':
			return pool.promise().query(
				'INSERT INTO artists (id, artist, rate, streams, paid) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE id=values(id), artist=values(artist), rate=values(rate), streams=values(streams), paid=values(paid)', 
				[id, artist, rate, streams, paid]
			).then(handleDbSuccess).catch(err => handleDbError(err))
		case 'GET':
			return pool.promise().query(
				'SELECT * FROM artists'
			).then(([rows]) => handleDbSuccess(rows)).catch(err => handleDbError(err))
	
		case 'PATCH':
			return pool.promise().query(
				'UPDATE artists SET paid = NOT paid WHERE id = ?', [id]
			).then(handleDbSuccess).catch(err => handleDbError(err))
	
		case 'DELETE':
			return pool.promise().query(
				'DELETE FROM artists WHERE id = ?', [delId]
			).then(handleDbSuccess).catch(err => handleDbError(err))
	}
}
