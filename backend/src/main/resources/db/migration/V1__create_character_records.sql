CREATE TABLE character_records (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    house VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    actor VARCHAR(150) NOT NULL,
    biography VARCHAR(2000) NOT NULL,
    sigil_color VARCHAR(7) NOT NULL,
    CONSTRAINT character_status_check CHECK (status IN ('ALIVE', 'DEAD', 'UNKNOWN'))
);

CREATE INDEX idx_character_records_house ON character_records (house);
CREATE INDEX idx_character_records_status ON character_records (status);
CREATE INDEX idx_character_records_name ON character_records (name);
