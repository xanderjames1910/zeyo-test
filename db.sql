CREATE TABLE processes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE process_history (
    id SERIAL PRIMARY KEY,
    process_id INTEGER REFERENCES processes(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    change_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    previous_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) NOT NULL
);