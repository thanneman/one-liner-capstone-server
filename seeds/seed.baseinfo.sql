TRUNCATE 
    users,
    jokes
    RESTART IDENTITY CASCADE;

INSERT INTO users (username, email, password)
VALUES
    ('demo@test.com', '$2a$12$obaE1yL0BOi1d0.5eZyGD.iu2EpZGd4irB7T16A2OSalb2Xr1GNti');

INSERT INTO jokes (user_id, question, answer, rating) VALUES
    (1, 'What do metals call their friends?', 'Their chromies', 5);