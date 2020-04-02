TRUNCATE 
    users,
    jokes,
    upvotes
    RESTART IDENTITY CASCADE;

INSERT INTO users (username, email, password)
VALUES
    ('demouser', 'demo@test.com', '$2a$12$obaE1yL0BOi1d0.5eZyGD.iu2EpZGd4irB7T16A2OSalb2Xr1GNti');

INSERT INTO jokes (user_id, question, answer, rating) VALUES
    (11, 'What do metals call their friends?', 'Their chromies', 5);

INSERT INTO upvotes (user_id, joke_id, upvoted)
VALUES
    (11, 39, TRUE);
