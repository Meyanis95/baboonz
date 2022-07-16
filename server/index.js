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
 
const PORT = process.env.PORT || 8888;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// const app = express();
// app.use(cors())

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

app.get('/signup', async (req, res) => {
    const eth_address = req.query.data;
    const nonce = v4()
    console.log('nonce juste generated', nonce)
    
    let { data, error } = await supabase
      .from('users')
      .select('nonce')
      .eq('eth_address', eth_address)

    if (data.length > 0) {
      let {data, error} = await supabase.from('users').update({nonce}).match({eth_address: eth_address})
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
      res.status(200).json({ nonce })
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
    var { data, error } = await supabase
    .from('safe_wallets')
    .insert({contract_address: _data.safeAddress, threshold: _data.threshold, owners: _data.members })
    
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

app.listen(PORT, () => {
  console.log(`serveur démarré : https://localhost:${PORT}`)
})