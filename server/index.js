require('dotenv').config()
const express = require("express");
const cors = require('cors');
//const {supabase} = require('./supabase');
const { v4 } = require('uuid')
const { ethers } = require('ethers')
const jwt = require('jsonwebtoken');
const path = require('path');
const history = require('history');
const cookieParser = require('cookie-parser');
const { createClient } = require('@supabase/supabase-js') 
const CoinGecko = require('coingecko-api');
 
const PORT = process.env.PORT || 8888;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const CoinGeckoClient = new CoinGecko();

const app = express();

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../client/build')));

app
  .use(express.static(path.resolve(__dirname, '../client/build')))
  .use(cors())
  .use(cookieParser())
  .use(express.static(path.resolve(__dirname, '../client/build')));

app.get('/', function (req, res) {
  res.render(path.resolve(__dirname, '../client/build/index.html'));
});

// app.get('/*', function(req, res) {
//   res.sendFile(path.resolve(__dirname, '../client/build/index.html'), function(err) {
//     if (err) {
//       res.status(500).send(err)
//     }
//   })
// })

app.get('/signup', async (req, res) => {
    const eth_address = req.query.data;
    const nonce = v4()
    console.log('nonce juste generated', nonce)
    
    let { data, error } = await supabase
      .from('users')
      .select('nonce')
      .eq('eth_address', eth_address)

    console.log(data)

    if (data.length > 0) {
      let {data, error} = await supabase.from('users').update({nonce}).match({eth_address: eth_address})
      var id = data[0].id
      console.log('id', id)
      console.log('data', data)
      console.log('error', error)
    } else {
      let {data, error} = await supabase.from('users').insert({nonce, eth_address})
      console.log('data', data)
      console.log('error', error)
    }
  
    if(error) {
      res.status(400).json({error: error.message})
    } else {
      res.status(200).json({ nonce, id })
    }
});

app.get('/verify', async (req, res) => {
  try {
    const { eth_address, signature, nonce } = req.query;
    const signerAddr = ethers.utils.verifyMessage(nonce, signature)

    if (signerAddr !== eth_address) {
      throw new Error ("wrong_signature")
    }

    let { data: user, error } = await supabase.from('users').select('*').eq('eth_address', eth_address).eq('nonce', nonce).single()

    const token = jwt.sign({
      "aud": "authenticated",
      "exp": Math.floor((Date.now() / 1000 + (60*60))),
      "sub": user.id,
      "user_metadata": {
        id: user.id
      },
      "role": "authenticated"
    }, process.env.SUPABASE_JWT)

    res.status(200).json({ user, token })
    } catch (error) {
      res.status(400).json({error: error.message})
    }
});

app.get('/createSafe', async (req, res) => {
  const _data = req.query;
  console.log('data we receive =>', _data)
  console.log('safe address we receive =>', _data.safeAddress)
  
  var { data, error } = await supabase
  .from('safe_wallets')
  .select('contract_address')
  .eq('contract_address', _data.safeAddress)

  if (data.length > 0) {
    res.status(400).json({ error_message: 'contract exists' })
  } else {
    let { data, error } = await supabase
    .from('safe_wallets')
    .insert({contract_address: _data.safeAddress, threshold: _data.threshold, owners: _data.owners, name: _data.name })
    
    if (error) {
      res.status(400).json({ error })
    } else {
      res.status(200).json({ data })
    }
  }
  
  if (error) {
    res.status(400).json({ error })
  }
});

app.get('/linkSafe', async (req,res) => {
  const _data = req.query

  let { data, error } = await supabase
  .from('user_safe')
  .insert({ user_address: _data.userAddress, safe_id: _data.safeId})
  
  if (error) {
    res.status(400).json({ error })
  } else {
    res.status(200).json({ data })
  }
})

app.get('/getSafe', async (req, res) => {
  const _data = req.query;
  
  var { data, error } = await supabase
  .from('safe_wallets')
  .select()
  .eq('contract_address', _data.safeAddress)

  if (error) {
    res.status(400).json({ error })
  } else {
    res.status(200).json({ data })
  }
  
});

app.get('/getSafeById', async (req, res) => {
  const _data = req.query;
  
  var { data, error } = await supabase
  .from('safe_wallets')
  .select()
  .eq('id', _data.squadId)
  .single()

  if (error) {
    res.status(400).json({ error })
  } else {
    console.log(data)
    res.status(200).json(data)
  }
  
});

app.get('/checkSafe', async (req, res) => {
  const _data = req.query;

  const user_address = _data.userAddress
  
  var { data, error } = await supabase
  .from('user_safe')
  .select()
  .eq('user_address', user_address)

  if (error) {
    res.status(400).json({ error })
  } else {
    res.status(200).json(data)
  }
  
});

app.get('/getEthPrice', async (req, res) => {
  const { data, error } = await CoinGeckoClient.simple.price({
      ids: ['ethereum', 'matic-network'],
      vs_currencies: ['eur', 'usd'],
  });
  
  if (error) {
    res.status(400).json({ error: error.message })
  } else {
    res.status(200).json({ data })
  }

})

app.listen(PORT, () => {
  console.log(`serveur démarré : https://localhost:${PORT}`)
})