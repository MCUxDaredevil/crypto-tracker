const {post} = require("axios");

async function placeBet(user_id, coin_id, amount) {

  const user = await post(process.env.DB_API + '/query', {
    query: `SELECT * FROM users WHERE user_id=?`,
    params: [user_id],
  });

  if (user.data.length === 0) {
    console.log('Creating new user')
    await post(process.env.DB_API + '/query', {
      query: `INSERT INTO users (user_id, points) VALUES (?, ?)`,
      params: [user_id, 0],
    });
  }

  const future = (new Date().getHours() % 12 <= 1) ? 1 : 0;

  const results = await post(process.env.DB_API + '/query', {
    query: `SELECT * FROM bets WHERE user_id=? AND coin_id=? AND future=?`,
    params: [user_id, coin_id, future],
  });

  if (results.data.length > 0) {
    console.log(results.data)
    return {error: 'You already placed a bet for this coin'};
  }

  try {
    return post(process.env.DB_API + '/bet', {
      user_id: user_id,
      coin_id: coin_id,
      amount: amount,
      future: future,
    });
  } catch (e) {
    console.error(e);
    return {error: 'Internal Server Error\n' + e.message};
  }
}

module.exports = {placeBet};