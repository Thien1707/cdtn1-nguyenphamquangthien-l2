const tokenSecret = process.env.JWT_SECRET;

if (typeof tokenSecret !== 'string' || tokenSecret.length < 32 || /replace-with|change-me/i.test(tokenSecret)) {
    throw new Error('Set JWT_SECRET to a unique random value of at least 32 characters');
}

module.exports = { tokenSecret };