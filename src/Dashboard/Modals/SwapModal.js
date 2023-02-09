import React,{useEffect, useState} from 'react'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, Text,View, Button, Modal, FlatList, TouchableOpacity, Alert , ActivityIndicator} from 'react-native';
import { TextInput } from 'react-native-paper';
import "@ethersproject/shims"
import { ethers } from "ethers"
import { getBalance } from "../../components/Redux/actions/auth";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from '@react-navigation/native';
import { urls } from '../constants';
import { getNonce, getGasPrice, sendSignedTx, getAmountsOut, SendTransaction, approveSwap } from '../../utilities/utilities';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Icon from "react-native-vector-icons/Ionicons"
import Modal2 from "react-native-modal";
import TokenList from '../tokens/TokenList';
import TokenHeader from '../tokens/TokenHeader';
import { getPair, getETHtoTokenPrice, getTokentoEthPrice,getTokens, createPool, SwapEthForTokens, swapTokensforEth } from '../tokens/swapFunctions';
import { SwapTokensToTokens, tokenTotokenPrice, UniSwap, UniswapSwap } from '../tokens/UniswapFunctions';
import tokenList from "../tokens/tokenList.json"
import PancakeList from "../tokens/pancakeSwap/PancakeList.json"
import chooseSwap from '../tokens/chooseSwap.json'
import { getSwapPrice } from '../tokens/pancakeSwap/pancakeFunctions';
import SelectSwap from './SelectSwap';
const UNISWAP = require("@uniswap/sdk")
const { Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType, Percent} = require("@uniswap/sdk");

const SwapModal = ({modalVisible,setModalVisible}) => {
    const[loading, setLoading]=useState(false)
    const[loading2, setLoading2]=useState(false)
    const[balance, setBalance]=useState('')
    const[openChain,setOpenChain] = useState(false)
    const [chooseChain,setChooseChain] = useState([])
    const[swapType,setSwapType]= useState('')
    const [name, setName]= useState('Swap')
    const[amount, setAmount]=useState('0')
    const[amount2, setAmount2]=useState('0')
    const [visible, setVisible] = useState(false)
    const [Tradevisible, setTradeVisible] = useState(false)
    const[label, setLabel] = useState('')
    const[label2, setLabel2] = useState('')
    const[trade,setTrade] = useState()
    const[walletType, setWalletType] = useState('')
    const state = useSelector((state) => state);
    const[coin0, setCoin0] = useState({
      name:'Token1',
    address:'',
    symbol:'',
    ChainId:''
  })
    const[coin1, setCoin1] = useState({
      name:'Token2',
    address:'',
    symbol:'',
    ChainId:''
  })
  const[tradePrice, setTradePrice] = useState({
    token1totoken2:'0',
    token2totoken1:'0'
  })
    const[Data, setData] = useState([])
    const[coinType, setCoinType] = useState()
   const navigation = useNavigation()
    console.log(state.wallet)
   
    
    const getCustomBalance = async ()=>{

  
     const response= await fetch(`http://${urls.testUrl}/user/getbalance`, {
        method: 'POST',
        headers: {
                 Accept: 'application/json',
                 'Content-Type': 'application/json'
        },
       body: JSON.stringify({
        token:label,
        walletAddress:state.wallet.address?state.wallet.address:''

      })  
       }).then((response) => response.json())
    .then((json) => {
      console.log(json);
      setBalance(json.responseData)
    })
    .catch((error) => {
      console.error(error);
    });


};
    

 
    
    const dispatch = useDispatch();

    const SaveTransaction = async (type,hash,walletType,chainType) => {
      const user = await state.user
      const token = await state.token

              try {
          const response= await fetch(`http://${urls.testUrl}/user/saveTx`, {
            method: 'POST',
            headers: {
                     Accept: 'application/json',
                     'Content-Type': 'application/json'
            },
           body: JSON.stringify({
            user: user,
            type:type,
            hash:hash,
            token:token,
            walletType:walletType,
            chainType:chainType

    
          })  
           }).then((response) => response.json())
        .then((json) => {
          
        })
        .catch((error) => {
          setLoading(false)
          alert(error)
          console.error(error);
        });
    
    
          } catch (error) {

            setLoading(false)
            alert(error)
            console.error(error);
          }
       
      
        
      };
    const Balance = async () => {
       
      if(state.wallet.address){

        await dispatch(getBalance(state.wallet.address))
        .then((response) => {
                
          console.log(response)
          const res =  response
          if (res.status == "success") {
            
            console.log(res)
            
            console.log('success')
            
          }
        })
        .catch((error) => {
          console.log(error)
          
          
        });
        
        
      }
      };

      const pancakeSwap = async (decrypt)=>{

        setLoading(true)
        setVisible(false)
        const token = await state.token
      
        const Wallet = await state.wallet.address
        if(!Wallet){
          return alert('please select a wallet first')
        }
        if(!amount||!coin0.address||!coin1.address){
          setLoading(false)
          return alert('All places are mandatory')
        }
      
        /*if(balance<=0){
          setLoading(false)
          console.log(balance)
          return alert('You do not have enough balance to make this transaction')
        }
      
        if(amount>=balance){
          setLoading(false)
          console.log(balance)
          return alert('You do not have enough balance to make this transaction')
        }
      
        
        if(token1===token2){
          setLoading(false)
          return alert('Same tokens cannot be swaped')
        }*/
      
      
        const addresses = {
          WBNB: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
          bnb : '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
          BUSD: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
          USDT:'0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
          DAI:'0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867',
          ETH:"0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378", 
          factory: "0x182859893230dC89b114d6e2D547BFFE30474a21",
          router: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
      }
      
      
      let address1=coin0.address
      let address2=coin1.address
      console.log(address1)
      
      console.log(address2)
      const PRIVATE_KEY = decrypt
          
      const provider =  new ethers.providers.JsonRpcProvider('https://bsc.getblock.io/a011daa0-3099-4f55-b22c-c3a3d55898d0/testnet/')
          const wallet = new ethers.Wallet(PRIVATE_KEY,provider);
          console.log(wallet)
              const gasPrice= await provider.getGasPrice()
          
             // const amountIn = (await ethers).utils.parseUnits(input.amount, "ether");
              const gas = {
                  gasPrice: gasPrice,
                  gasLimit: '500000'
              };
          
              const amountIn = (await ethers).utils.parseUnits(amount, "ether");
      
          
             // console.log(Contract)
              try{
                if(coin0.symbol=='BNB'){
                  const type ='BNBTOTOKEN'
      
                  console.log('starting')
                  const RouterABI = [
                    'function swapExactETHForTokens( uint256 amountOutMin, address[] calldata path, address to, uint256 deadline ) external payable virtual returns (uint256[] memory amounts)',
                    'function swapExactETHForTokensSupportingFeeOnTransferTokens( uint256 amountOutMin, address[] calldata path, address to, uint256 deadline ) external payable virtual',
                  ]
         
                  const pancakeRouterContract = new ethers.Contract(addresses.router, RouterABI)
                 // const amounts = await router.getAmountsOut(amountIn, [addresses.WBNB, address2]);
                  const amountOutMin = await getAmountsOut(amountIn,address1,address2,type)
                  
      
                
                  const  nonce  = await provider.getTransactionCount(wallet.address) // get from '/getNonce' route
                  const gasLimit = 500000
                  const deadline = Math.floor(Date.now() / 1000) + 60 * 10
      
                  
                  const unsignedTx = await pancakeRouterContract.populateTransaction.swapExactETHForTokens(
                    amountOutMin,
                    [addresses.WBNB, address2],
                    wallet.address,
                    deadline,
                    {
                      nonce,
                      gasPrice,
                      gasLimit,
                      value: amountIn
                    },
                  )
                
                
                  const signedTx = await wallet.signTransaction(unsignedTx)
                 console.log(signedTx)
                 const tx = await provider.sendTransaction(signedTx)//SendTransaction(signedTx,token)
                // const txx = await tx.wait()
                 console.log(tx)
                 if(tx.hash){
                   
                   
      
                   const type ='Swap'
                   try{
      
                    const chainType = 'BSC'
                     const saveTransaction = await SaveTransaction(type,tx.hash,walletType,chainType)
                     console.log(saveTransaction)
                    // await getCustomBalance()
                     alert("Your Tx Hash : "+tx.hash)
                      navigation.navigate('Transactions')
                    }catch(e){
                      alert(e)
                      console.log(e)
                    }
      
                 }else{
                  alert('transaction failed')
                 }
                
                }
                else if(coin1.symbol==='BNB'){
                  const type ='TOKENTOBNB'
                  const approve = await approveSwap(address1,amountIn,decrypt,token)
                   console.log(approve)
                  console.log('starting swap to bnb')
                    const wallet = new ethers.Wallet(PRIVATE_KEY)
                  
                    const RouterABI = [
                      'function swapExactTokensForETH( uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline ) external virtual returns (uint256[] memory amounts)',
                      'function swapExactTokensForETHSupportingFeeOnTransferTokens( uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external virtual',
                    ]
                  
                    const pancakeRouterContract = new ethers.Contract(addresses.router, RouterABI)
                    
                   
                    
      
                      const amountsOutMin = await getAmountsOut(amountIn,address1,address2,type)
                      
                      
                      const  nonce  = await provider.getTransactionCount(wallet.address) // get from '/getNonce' route
                      // get from '/getNonce' route
                      const  gasPrice  = provider.getGasPrice() // get from '/getGasPrice' route
                      const gasLimit = 500000
                      const DEADLINE = Math.floor(Date.now() / 1000) + 60 * 10
                      
                      const unsignedTx = await pancakeRouterContract.populateTransaction.swapExactTokensForETH(
                        amountIn,
                        amountsOutMin,
                        [address1, addresses.WBNB],
                        wallet.address,
                        DEADLINE,
                        {
                          nonce,
                          gasPrice,
                          gasLimit,
                        },
                        )
                        
                        const signedTx = await wallet.signTransaction(unsignedTx)
                        console.log(signedTx)
                        const Tx = await provider.sendTransaction(signedTx)//SendTransaction(signedTx,token)
                        //const tx = await sendSignedTx.wait()
                       // console.log(tx.Hash)
                       if(Tx.hash){
      
                        const type = 'Swap'
                        const chainType = 'BSC'
                        const saveTransaction = await SaveTransaction(type,Tx.hash,walletType,chainType)
                        console.log(saveTransaction)
                        //await getCustomBalance()
                        alert("Your Tx Hash : "+Tx.hash)
                        navigation.navigate('Transactions')                  }
                        else{
                          alert('Swap failed')
                        }
                        
                      }
                      else{
      
                    
                        const type ='TOKENTOTOKEN'
      
                 
      const approve = await approveSwap(address1,amountIn,decrypt,token)
      console.log(approve)
      
        const RouterABI = [
          'function swapExactTokensForTokens( uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external virtual returns (uint256[] memory amounts)',
          'function swapExactTokensForTokensSupportingFeeOnTransferTokens( uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external virtual returns (uint256[] memory amounts)',
        ]
      
        const pancakeRouterContract = new ethers.Contract(addresses.router, RouterABI)
        const amountsOutMin = getAmountsOut(amountIn,address1,address2,type)
      
        const  nonce  = await provider.getTransactionCount(wallet.address) // get from '/getNonce' route
                      // get from '/getNonce' route
                      const  gasPrice  = provider.getGasPrice()
                      const gasLimit = 500000
        const DEADLINE = Math.floor(Date.now() / 1000) + 60 * 10
      
        const unsignedTx = await pancakeRouterContract.populateTransaction.swapExactTokensForTokens(
          amountIn,
          amountsOutMin,
          [address1, address2],
          wallet.address,
          DEADLINE,
          {
            nonce,
            gasPrice,
            gasLimit,
          },
        )
      
        const signedTx = await wallet.signTransaction(unsignedTx)
        console.log(signedTx)
        const Tx =   await provider.sendTransaction(signedTx)//SendTransaction(signedTx,token)
        console.log(Tx.hash)
        if(Tx.hash){
      
          const type = 'Swap'
          const chainType = 'BSC'
          const saveTransaction = await SaveTransaction(type,Tx.hash,walletType,chainType)
          console.log(saveTransaction)
          //await getCustomBalance()
          alert("Your Tx Hash : "+Tx.hash)
          navigation.navigate('Transactions')    }
          else{
            alert('Swap failed')
          }
      
        
                  }
                }catch(e){
                  
                  console.log(e)
                  setLoading(false)
                  alert(e)
                }
                setLoading(false)
              
      }



    
      
      useEffect(async() => {
        
        AsyncStorage.getItem('walletType')
        .then(async (type)=>{
          console.log(JSON.parse (type))
          const Type = JSON.parse (type)
          setWalletType(Type)
          
         if(Type==='Multi-coin'){

          setData(chooseSwap)
          setChooseChain(chooseSwap)
         
         }
          else if(Type==='Ethereum'){
            const data = tokenList.reverse()
         // console.log(data)
         setChooseChain(data)
          setData(data)
          }
          else if(Type==='BSC'){
            const data = PancakeList
            console.log(data)
            setChooseChain(data)
            setData(data)
          }
        })
        
      /* await getPrice(coin0.address,coin1.address)
       .then((response)=>{
        console.log(response)
        setTradePrice(response)

       })*/
        Balance()
       }, [])

       useEffect(async() => {
        
        AsyncStorage.getItem('walletType')
        .then(async (type)=>{
          console.log(JSON.parse (type))
          const Type = JSON.parse (type)
          setWalletType(Type)
          
         if(Type==='Multi-coin'){

          setData(chooseSwap)
          setChooseChain(chooseSwap)
         
         }
          else if(Type==='Ethereum'){
            const data = tokenList.reverse()
         // console.log(data)
         setChooseChain(data)
          setData(data)
          }
          else if(Type==='BSC'){
            const data = PancakeList
            console.log(data)
            setChooseChain(data)
            setData(data)
          }
        })
        
      /* await getPrice(coin0.address,coin1.address)
       .then((response)=>{
        console.log(response)
        setTradePrice(response)

       })*/
        Balance()
       }, [state.wallet])


       useEffect(async()=>{
        console.log(coin0)
        if(coin0.ChainId===1||coin0.ChainId===5){

          const data = tokenList
         // console.log(data)
          setData(data)
        }else{
          const data = PancakeList
          //  console.log(data)
            setData(data)
        }

       },[coin0])

  return (
    <View style={{marginTop:hp(50)}} >
        
    <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  statusBarTranslucent={true}
  onRequestClose={() => {

    setModalVisible(false)
}}>
  
  <View
    style={{
      height: '93%',
      marginTop: 'auto',
      backgroundColor:'white',     
    }}>
      <TokenHeader setVisible={setModalVisible} name={name}/>
    <View style={styles.footer}>
      <View elevation={5}>
      <View style={styles.container}>
        <View style={{  borderRadius:10,height:hp(20), backgroundColor:'white'}}>
      <Text style={{margin:10, color:'grey'}}>You Pay</Text>
      <View style={{display:'flex', flexDirection:'row'}}> 

      <TextInput style={styles.textInput2} 
      placeholder="0"
      onChangeText={(text) => {
        setAmount(text)
      }}
      />
      <Text style={{marginTop:hp(0),marginLeft:wp(8), color: 'black',
        fontSize: 18}}>{coin0.name}</Text>
        <TouchableOpacity style={{position:'absolute', marginLeft:wp(70), marginTop:hp(3)}} onPress={()=>{
        setCoinType('0')
        
          
          setOpenChain(true)
       
      }}>

      <Icon  name={"ios-chevron-forward-circle"} size={40} color={"grey"} />
      </TouchableOpacity>
      </View>
      <Text style={{margin:5, color:'grey'}}>Balance:{0}</Text>
      </View>
      <Icon  name={"swap-vertical"} size={44} color={"grey"} style={{position:'absolute',marginLeft:wp(70), marginTop:hp(19), zIndex:100}} />
      <View style={{ borderRadius:10,height:hp(20), backgroundColor:'white', marginTop:hp(0.5)}}>
      <Text style={{margin:10, color:'grey'}}>You Get</Text>
      <View style={{display:'flex', flexDirection:'row'}}> 

      <TextInput style={styles.textInput2} 
      placeholder={tradePrice?`${tradePrice.token1totoken2}`:'0'}
      onChangeText={(text) => {
        setAmount2(text)
      }}
      />
      <Text style={{marginTop:hp(0),marginLeft:wp(9), color: 'black',
        fontSize: 18}}>{coin1.name}</Text>
        <TouchableOpacity style={{position:'absolute', marginLeft:wp(70), marginTop:hp(3)}} onPress={()=>{
        setCoinType('1')
        setVisible(true)
      }}>
      <Icon  name={"ios-chevron-forward-circle"} size={40} color={"grey"}/></TouchableOpacity>
      </View>
      <Text style={{margin:5, color:'grey'}}>Balance:{0}</Text>
      </View>
      </View>
      </View>
      <Text style={{marginLeft:wp(15)}} > {amount} {coin0.name} = {tradePrice?tradePrice.token1totoken2:''} {coin1.name}</Text>
      <Text style={{marginLeft:wp(15)}} > {amount2} {coin1.name} = {tradePrice?tradePrice.token2totoken1:''} {coin0.name}</Text>

    </View>
    <TouchableOpacity
    style={styles.addButton2}
    onPress={async () => {
      //setVisible(true)
      setLoading2(true)
      console.log(coin1.address)
      const token = await state.token

      const Wallet =await state.wallet
      console.log(Wallet)
      if(walletType==='Ethereum'){

        if(Wallet){
          if(coin0.symbol==='WETH'){
            
            await getETHtoTokenPrice(coin1.address,amount)
            .then((resp)=>{
              console.log(resp)
              if(resp){
                console.log(resp)
                setLoading2(false)
                setTradePrice(resp)
                setTrade(resp.trade)
                setTradeVisible(true)
                
              }
            }).catch((e)=>{
              setLoading2(false)
              console.log(e)
            })
          }else if(coin1.symbol==="WETH"){
            await getTokentoEthPrice(coin0.address,amount)
            .then((resp)=>{
              console.log(resp)
              if(resp){
                console.log(resp)
                setTradePrice(resp)
                setTrade(resp.trade)
                setTradeVisible(true)
                setLoading2(false)

              }
            }).catch((e)=>{
              setLoading2(false)

              console.log(e)
            })
          }
          else{
            tokenTotokenPrice(Wallet.address,coin0.address,coin1.address,amount)
            .then((response)=>{
              console.log(response)
                setTradePrice(response)
                setTrade(response.trade)
                setTradeVisible(true)
                setLoading2(false)
            }).catch((e)=>{
              console.log(e)
              setLoading2(false)
              return alert('error fetching pair prices. please try again')
            })
          }
        }
      }else if(walletType==='BSC'){

        console.log(coin0.address,coin1.address)
        let amountIn = (await ethers).utils.parseUnits(amount, "ether")
        let type
        if(coin0.symbol==="BNB"){
           type ='BNBTOTOKEN'
           await getSwapPrice(amountIn,coin0.address,coin1.address,type)
        .then((response)=>{
          const trade ={
            slippageTolerance:1,
            minimumAmountOut:response.token1totoken2
          }
          console.log(response.token1totoken2)
          setTradePrice(response.token1totoken2)
          setTrade(trade)
          setTradeVisible(true)
          setLoading2(false)

        }).catch((e)=>{
          setLoading2(false)
          console.log(e)
          alert(e)
        })

        }else if(coin1.symbol==="BNB"){
          type= "TOKENTOBNB"
          await getSwapPrice(amountIn,coin0.address,coin1.address,type)
        .then((response)=>{
          const trade ={
            slippageTolerance:1,
            minimumAmountOut:response.token1totoken2
          }
          console.log(response.token1totoken2)
          setTradePrice(response.token1totoken2)
          setTrade(trade)
          setTradeVisible(true)
          setLoading2(false)

        }).catch((e)=>{
          setLoading2(false)
          console.log(e)
          alert(e)
        })
        }else{
          type = "TOKENTOTOKEN"
          const approve = await approveSwap(coin0.address,amountIn,Wallet.privateKey,token)
          .then(async (next)=>{
            await getSwapPrice(amountIn,coin0.address,coin1.address,type)
          .then(async (response)=>{
          const trade ={
            slippageTolerance:1,
            minimumAmountOut:response.token1totoken2
          }
          console.log(response.token1totoken2)
          setTradePrice(response.token1totoken2)
          setTrade(trade)
          setTradeVisible(true)
          setLoading2(false)


        }).catch((e)=>{
          setLoading2(false)
          alert('Insufficient liquidity. please try with a different token')
          console.log(e)
        })
          })
          console.log(approve)
          setLoading2(false)

        }
     
      }else if(walletType==='Multi-coin'){
        if(swapType==='ETH'){

          if(Wallet){
            if(coin0.symbol==='WETH'){
              
              await getETHtoTokenPrice(coin1.address,amount)
              .then((resp)=>{
                console.log(resp)
                if(resp){
                  console.log(resp)
                  setLoading2(false)
                  setTradePrice(resp)
                  setTrade(resp.trade)
                  setTradeVisible(true)
                  
                }
              }).catch((e)=>{
                setLoading2(false)
                console.log(e)
              })
            }else if(coin1.symbol==="WETH"){
              await getTokentoEthPrice(coin0.address,amount)
              .then((resp)=>{
                console.log(resp)
                if(resp){
                  console.log(resp)
                  setTradePrice(resp)
                  setTrade(resp.trade)
                  setTradeVisible(true)
                  setLoading2(false)
  
                }
              }).catch((e)=>{
                setLoading2(false)
  
                console.log(e)
              })
            }
            else{
              tokenTotokenPrice(Wallet.address,coin0.address,coin1.address,amount)
              .then((response)=>{
                console.log(response)
                  setTradePrice(response)
                  setTrade(response.trade)
                  setTradeVisible(true)
                  setLoading2(false)
              }).catch((e)=>{
                console.log(e)
                setLoading2(false)
                return alert('error fetching pair prices. please try again')
              })
            }
          }
        }else if(swapType==='BSC'){
  
          console.log(coin0.address,coin1.address)
          let amountIn = (await ethers).utils.parseUnits(amount, "ether")
          let type
          if(coin0.symbol==="BNB"){
             type ='BNBTOTOKEN'
             await getSwapPrice(amountIn,coin0.address,coin1.address,type)
          .then((response)=>{
            const trade ={
              slippageTolerance:1,
              minimumAmountOut:response.token1totoken2
            }
            console.log(response.token1totoken2)
            setTradePrice(response.token1totoken2)
            setTrade(trade)
            setTradeVisible(true)
            setLoading2(false)
  
          }).catch((e)=>{
            setLoading2(false)
            console.log(e)
            alert(e)
          })
  
          }else if(coin1.symbol==="BNB"){
            type= "TOKENTOBNB"
            await getSwapPrice(amountIn,coin0.address,coin1.address,type)
          .then((response)=>{
            const trade ={
              slippageTolerance:1,
              minimumAmountOut:response.token1totoken2
            }
            console.log(response.token1totoken2)
            setTradePrice(response.token1totoken2)
            setTrade(trade)
            setTradeVisible(true)
            setLoading2(false)
  
          }).catch((e)=>{
            setLoading2(false)
            console.log(e)
            alert(e)
          })
          }else{
            type = "TOKENTOTOKEN"
            const approve = await approveSwap(coin0.address,amountIn,Wallet.privateKey,token)
            .then(async (next)=>{
              await getSwapPrice(amountIn,coin0.address,coin1.address,type)
            .then(async (response)=>{
            const trade ={
              slippageTolerance:1,
              minimumAmountOut:response.token1totoken2
            }
            console.log(response.token1totoken2)
            setTradePrice(response.token1totoken2)
            setTrade(trade)
            setTradeVisible(true)
            setLoading2(false)
  
  
          }).catch((e)=>{
            setLoading2(false)
            alert('Insufficient liquidity. please try with a different token')
            console.log(e)
          })
            })
            console.log(approve)
            setLoading2(false)
  
          }
       
        }
      }else{
        return alert('Swap not supported for chain')
      }
        
        }}>
    <Text style={styles.addButtonText}>{loading2? <ActivityIndicator size="small" color="white" />:"Swap"}</Text>
  </TouchableOpacity>

  </View>
<Modal2
  animationIn="slideInRight"
  animationOut="slideOutRight"
  animationInTiming={100}
  animationOutTiming={200}
  isVisible={openChain}
  useNativeDriver={true}
  onBackButtonPress={() => {
    //setShowModal(!showModal);
    setOpenChain(false)
  }}>
  <View
    style={{
      height: hp(98),
      width:wp(99),
      backgroundColor:'#ddd',
      borderTopRightRadius:10,
      borderTopLeftRadius:10,
      marginTop:hp(5),
      left:wp(-4.5)     
    }}>
      
        
   
      <TokenList setVisible={setOpenChain} setCoin0={setCoin0} setCoin1={setCoin1} data={chooseChain} coinType={coinType} walletType={walletType} setSwapType={setSwapType}/>
  </View>
</Modal2>
<Modal2
  animationIn="slideInRight"
  animationOut="slideOutRight"
  animationInTiming={100}
  animationOutTiming={200}
  isVisible={visible}
  useNativeDriver={true}
  onBackButtonPress={() => {
    //setShowModal(!showModal);
    setVisible(false)
  }}>
  <View
    style={{
      height: hp(98),
      width:wp(99),
      backgroundColor:'#ddd',
      borderTopRightRadius:10,
      borderTopLeftRadius:10,
      marginTop:hp(5),
      left:wp(-4.5)     
    }}>
      
        
   
      <TokenList setVisible={setVisible} setCoin0={setCoin0} setCoin1={setCoin1} data={Data} coinType={coinType} walletType={walletType} setSwapType={setSwapType}/>
  </View>
</Modal2>

<Modal2
  animationIn="slideInRight"
  animationOut="slideOutRight"
  animationInTiming={500}
  animationOutTiming={650}
  isVisible={Tradevisible}
  useNativeDriver={true}
  onBackButtonPress={() => {
    setTradeVisible(false);
  }}>
  <View
    style={{
      height: hp(50),
      width:wp(70),
      backgroundColor:'#ddd',
      borderTopRightRadius:10,
      borderTopLeftRadius:10,
      marginTop:hp(5),
      left:wp(10)     
    }}>
      <View style={{display:'flex',alignItems:'center',alignContent:'center', marginTop:hp(10)}}>

     <Text style={{marginTop:hp(2)}}>slippageTolerance:{trade?trade.slippageTolerance:0} %</Text>
     <Text style={{marginTop:hp(2)}}>amount : {amount?amount:0} {coin0.name}</Text>
     <Text style={{marginTop:hp(2)}}> You get : {trade?trade.minimumAmountOut:0} {coin1.name}</Text>


      <TouchableOpacity
      disabled={loading===true?true:false}
      style={styles.addButton3}
      onPress={async () => {
        try{
          setLoading(true)
          const walletType = await AsyncStorage.getItem('walletType')
          console.log(JSON.parse(walletType))
          const Wallet =await state.wallet
          console.log(Wallet)
          if(JSON.parse(walletType)==='Ethereum'){
            
            if(Wallet){
              if(coin0.symbol==='WETH'){
                
                
                await SwapEthForTokens(Wallet.privateKey,Wallet.address,coin1.address,amount)
                .then(async (response)=>{
                  console.log(response)
                  if(response){
                    if(response.code===400){
                      return alert('server error please try again')
                    }
                    else if(response.code===401){
                      console.log(response)
                      const type ='Swap'
                      const wallettype = JSON.parse( walletType )
                      const chainType = 'Eth'
                      await SaveTransaction(type,response.tx.transactionHash,wallettype,chainType)
                      .then((resp)=>{
                        setLoading(false)
                        setTradeVisible(false)
                        setModalVisible(false)
                        
                        alert("Your Tx Hash : "+response.tx.transactionHash)
                        navigation.navigate('Transactions')
                      })
                      .catch((e)=>{
                        setLoading(false)
                        
                        console.log(e)
                      })
                      
                    }else if(response.code===404){
                      setLoading(false)
                      setTradeVisible(false);
                      
                      return alert('pair not found')
                    }else{
                      setLoading(false)
                      setTradeVisible(false);
                      
                      return alert(response)
                    }
                  }else{
                    setLoading(false)
                    setTradeVisible(false);
                    
                    return alert('server error')
                  }
                }).catch((e)=>{
                  setLoading(false)
                  setTradeVisible(false);
                  
                  console.log(e)
                })
              }else if(coin1.symbol==="WETH"){
                await UniSwap(Wallet.privateKey,Wallet.address,coin0.address,amount)
                .then(async(response)=>{
                  console.log(response)
                  if(response){
                    if(response.code===401){
                      console.log("Your Tx Hash : "+response.tx)
                      const type ='Swap'
                      const wallettype = JSON.parse( walletType )
                    const chainType = 'Eth'
                    await SaveTransaction(type,response.tx,wallettype,chainType)
                    .then((resp)=>{
                      
                      setLoading(false)
                      setTradeVisible(false);
                      setModalVisible(false)
                      
                      alert("Your Tx Hash : "+response.tx)
                      navigation.navigate('Transactions')
                      
                    })
                    .catch((e)=>{
                      setLoading(false)
                      setTradeVisible(false);
                      
                      console.log(e)
                    })
                    
                  }else if(response.code===400){
                    
                    return alert('error while swapping. please try again')
                  }
                  
                  else if(response===404){
                    setLoading(false)
                    setTradeVisible(false);
                    
                    return alert('pair not found')
                  }else{
                    setLoading(false)
                    setTradeVisible(false);
                    
                    return alert(response)
                  }
                }else{
                  setLoading(false)
                  setTradeVisible(false);
                  
                  return alert('server error')
                }
              }).catch((e)=>{
                setLoading(false)
                setTradeVisible(false);
                
                console.log(e)
              })
            }
            else{
              await SwapTokensToTokens (Wallet.privateKey,Wallet.address,coin0.address,coin1.address,amount)
              .then(async (response)=>{
                console.log(response)
                if(response){
                  if(response.code==401){
                    console.log(response)
                    const type ='Swap'
                    const wallettype = JSON.parse( walletType )
                    const chainType = 'Eth'
                    const saveTransaction = await SaveTransaction(type,response.tx,wallettype,chainType)
                    .then((resp)=>{
                      setLoading(false)
                      setTradeVisible(false);
                      setModalVisible(false)
                      
                      alert("Your Tx Hash : "+response.tx)
                      navigation.navigate('Transactions')
                    })
                    .catch((e)=>{
                      setLoading(false)
                      setTradeVisible(false);
                      
                      console.log(e)
                    })
                  }else if(response===404){
                    setLoading(false)
                    setTradeVisible(false);
                    
                    return alert('pair not found')
                  }else{
                    setLoading(false)
                    setTradeVisible(false);
                    
                    return alert(response)
                  }
                }else{
                  setLoading(false)
                  setTradeVisible(false);
                  
                  return alert('server error')
                }
              }).catch((e)=>{
                setLoading(false)
                setTradeVisible(false);
                
                console.log(e)
              })
            }
          }
          else{
            setLoading(false)
            
            alert('no wallets found')
          }
        }else if(JSON.parse(walletType)==='BSC'){
          const swap = await pancakeSwap(Wallet.privateKey)
          setModalVisible(false)
          setLoading(false)
          setTradeVisible(false);
          
        }
        else if(JSON.parse(walletType)==='Multi-coin'){
          if(swapType==='ETH'){
            
            if(Wallet){
              if(coin0.symbol==='WETH'){
                
                
                await SwapEthForTokens(Wallet.privateKey,Wallet.address,coin1.address,amount)
                .then(async (response)=>{
                  console.log(response)
                  if(response){
                    if(response.code===400){
                      return alert('server error please try again')
                    }
                    else if(response.code===401){
                      console.log(response)
                      const type ='Swap'
                      const wallettype = JSON.parse( walletType )
                      const chainType = 'Eth'
                      await SaveTransaction(type,response.tx.transactionHash,wallettype,chainType)
                      .then((resp)=>{
                        setLoading(false)
                        setTradeVisible(false)
                        setModalVisible(false)
                        
                        alert("Your Tx Hash : "+response.tx.transactionHash)
                        navigation.navigate('Transactions')
                      })
                      .catch((e)=>{
                        setLoading(false)
                        
                        console.log(e)
                      })
                      
                    }else if(response.code===404){
                      setLoading(false)
                      setTradeVisible(false);
                      
                      return alert('pair not found')
                    }else{
                      setLoading(false)
                      setTradeVisible(false);
                      
                      return alert(response)
                    }
                  }else{
                    setLoading(false)
                    setTradeVisible(false);
                    
                    return alert('server error')
                  }
                }).catch((e)=>{
                  setLoading(false)
                  setTradeVisible(false);
                  
                  console.log(e)
                })
              }else if(coin1.symbol==="WETH"){
                await UniSwap(Wallet.privateKey,Wallet.address,coin0.address,amount)
                .then(async(response)=>{
                  console.log(response)
                  if(response){
                    if(response.code===401){
                      console.log("Your Tx Hash : "+response.tx)
                      const type ='Swap'
                      const wallettype = JSON.parse( walletType )
                      const chainType = 'Eth'
                      await SaveTransaction(type,response.tx,wallettype,chainType)
                      .then((resp)=>{
                        
                        setLoading(false)
                        setTradeVisible(false);
                        setModalVisible(false)
                        
                        alert("Your Tx Hash : "+response.tx)
                        navigation.navigate('Transactions')
                        
                      })
                      .catch((e)=>{
                        setLoading(false)
                        setTradeVisible(false);
                        
                        console.log(e)
                      })
                      
                    }else if(response.code===400){
                      
                      return alert('error while swapping. please try again')
                    }
                    
                    else if(response===404){
                      setLoading(false)
                      setTradeVisible(false);
                      
                      return alert('pair not found')
                    }else{
                      setLoading(false)
                      setTradeVisible(false);
                      
                      return alert(response)
                    }
                  }else{
                    setLoading(false)
                    setTradeVisible(false);
                    
                    return alert('server error')
                  }
                }).catch((e)=>{
                  setLoading(false)
                  setTradeVisible(false);
                  
                  console.log(e)
                })
              }
              else{
                await SwapTokensToTokens (Wallet.privateKey,Wallet.address,coin0.address,coin1.address,amount)
                .then(async (response)=>{
                  console.log(response)
                  if(response){
                    if(response.code==401){
                      console.log(response)
                      const type ='Swap'
                      const wallettype = JSON.parse( walletType )
                      const chainType = 'Eth'
                      const saveTransaction = await SaveTransaction(type,response.tx,wallettype,chainType)
                      .then((resp)=>{
                        setLoading(false)
                        setTradeVisible(false);
                        setModalVisible(false)
                        
                        alert("Your Tx Hash : "+response.tx)
                        navigation.navigate('Transactions')
                      })
                      .catch((e)=>{
                        setLoading(false)
                        setTradeVisible(false);
                        
                        console.log(e)
                      })
                    }else if(response===404){
                      setLoading(false)
                      setTradeVisible(false);
                      
                      return alert('pair not found')
                    }else{
                      setLoading(false)
                      setTradeVisible(false);
                      
                      return alert(response)
                    }
                  }else{
                    setLoading(false)
                    setTradeVisible(false);
                    
                    return alert('server error')
                  }
                }).catch((e)=>{
                  setLoading(false)
                  setTradeVisible(false);
                  
                  console.log(e)
                })
              }
            }
            else{
              setLoading(false)
              
              alert('no wallets found')
            }
          }else if(swapType==='BSC'){
            const swap = await pancakeSwap(Wallet.privateKey)
            setModalVisible(false)
            setLoading(false)
            setTradeVisible(false);
            
          }
          
        }
      }catch(e){
        setLoading(false)
        setTradeVisible(false);
        
        console.log(e)
      }
    }}>
      <Text style={styles.addButtonText}>{loading? <ActivityIndicator size="small" color="white" />:"Confirm"}
</Text>
      </TouchableOpacity>
      
      
      
      </View>
      
  </View>
</Modal2>
        </Modal>
</View>
  )
}

export default SwapModal

const styles = StyleSheet.create({
    
      Amount:{
      display:'flex',
      alignItems:'center',
      textAlign:'center',
      justifyContent:'center'
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      headerText: {
        color: 'black',
        fontSize: 18,
        padding: 26,
      },
      noteHeader: {
        backgroundColor: '#42f5aa',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
      },
      footer: {
        flex: 1,
        backgroundColor: '#ddd',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
      },
      textInput: {
       borderWidth:1,
       borderColor:'grey',
       width:390,
       margin:10,
       borderRadius:10,
       shadowColor: "#000",
       height:40,
shadowOffset: {
	width: 0,
	height: 12,
},
shadowOpacity: 0.58,
shadowRadius: 16.00,

elevation: 24,
      },
    
      textInput2: {
        borderWidth:1,
        borderColor:'grey',
        width:200,
        margin:10,
        borderRadius:10,
        shadowColor: "#000",
        height:50,
 shadowOffset: {
     width: 0,
     height: 12,
 },
 shadowOpacity: 0.58,
 shadowRadius: 16.00,
 
 elevation: 24,
       },
     
      addButton: {
        position: 'absolute',
        zIndex: 11,
        right: 20,
        bottom: 10,
        backgroundColor: 'red',
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
      },
      addButton2: {
        position: 'absolute',
        zIndex: 11,
        left: wp(10),
        bottom: hp(23),
        backgroundColor: '#000C66',
        width: wp(80),
        height: 70,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
      },
      addButton3: {
        top:hp(5),
        backgroundColor: '#000C66',
        width: wp(40),
        height: 70,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
      },
      addButtonText: {
        color: '#fff',
        fontSize: 18,
      },
      container: {
        backgroundColor: '#ddd',
        padding: 16,
      },
      dropdown: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
      },
      icon: {
        marginRight: 5,
      },
      label: {
        position: 'absolute',
        backgroundColor: '#ddd',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
      },
      placeholderStyle: {
        fontSize: 16,
      },
      selectedTextStyle: {
        fontSize: 16,
      },
      iconStyle: {
        width: 20,
        height: 20,
      },
      inputSearchStyle: {
        height: 40,
        fontSize: 16,
      },
      

})

/*
const wbnb = new ethers.Contract(
              addresses.WBNB,
              ['function approve(address spender, uint amount) public returns(bool)'],
              account
          )
            const approveTx = await wbnb.approve(addresses.router, ethers.utils.parseUnits('1'), gas);
            console.log(approveTx)
            const approveRecipt = await approveTx.wait();
            console.log(approveRecipt.transactionHash);
            const amounts = await router.getAmountsOut(amountIn, [address1, address2]);
            const amountOutMin = amounts[1].sub(amounts[1].div(10)); 
            
            const swapTx = await router.swapExactETHForTokens(
              amountOutMin, // Degen ape don't give a fuxk about slippage
              [addresses.WBNB, address2],
              wallet.address,
              Math.floor(Date.now() / 1000) + 60 * 20, // 10 minutes from now
              {
                  gas,
                  value: amountIn
              }
          );

          const swapReceipt = await swapTx.wait();
          console.log(swapReceipt);
          console.log("Swap success!!");
*/

/* const approveTx = await Contract.approve(addresses.router, ethers.utils.parseUnits('1'), gas);
            console.log(approveTx)
            const approveRecipt = await approveTx.wait();
            console.log(approveRecipt.transactionHash);
           // const amounts = await router.getAmountsOut(amountIn, [address1, address2]);
            const amountOutMin = await getAmountsOut(amountIn,address1,address2,type);//amounts[1].sub(amounts[1].div(10)); 
            
            
            const swapTx = await router.swapExactTokensForTokens(
              amountIn, 
              amountOutMin, 
              [address1, address2], 
              wallet.address,
              Date.now() + 1000 * 60 * 10,
              gas 
              );
              
              const swapReceipt = await swapTx.wait();
              console.log(swapReceipt);
              console.log("Swap success!!");
              if(swapReceipt.transactionHash){
                try{

                  const type = 'Swap'
                  const saveTransaction = await SaveTransaction(type,swapReceipt.transactionHash)
                  console.log(saveTransaction)
                  alert(`Swap Successful. Tx Hash : ${swapReceipt.transactionHash} `)
                  setLoading(false)
                  await getCustomBalance()
                 }catch(e){
                   alert(e)
                   console.log(e)
                 }
               
                
              }
              else{
                setLoading(false)
                return alert('swap Failed')
                
              }*/

              /*
              
              const check2 = async (decrypt)=>{

  setLoading(true)
  setVisible(false)
  const token = await state.token

  const Wallet = await state.wallet.address
  if(!Wallet){
    return alert('please select a wallet first')
  }
  if(!amount||!coin0.address||!coin1.address){
    setLoading(false)
    return alert('All places are mandatory')
  }

  /*if(balance<=0){
    setLoading(false)
    console.log(balance)
    return alert('You do not have enough balance to make this transaction')
  }

  if(amount>=balance){
    setLoading(false)
    console.log(balance)
    return alert('You do not have enough balance to make this transaction')
  }

  
  if(token1===token2){
    setLoading(false)
    return alert('Same tokens cannot be swaped')
  }*/


  /*const addresses = {
    WBNB: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
    bnb : '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    BUSD: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
    USDT:'0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    DAI:'0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867',
    ETH:"0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378", 
    factory: "0x182859893230dC89b114d6e2D547BFFE30474a21",
    router: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
}


let address1=coin0.address
let address2=coin1.address
console.log(address1)

console.log(address2)
const PRIVATE_KEY = decrypt
    
const provider =  new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545')
    const wallet = new ethers.Wallet(PRIVATE_KEY,provider);
    console.log(wallet)
        const gasPrice= await provider.getGasPrice()
    
       // const amountIn = (await ethers).utils.parseUnits(input.amount, "ether");
        const gas = {
            gasPrice: gasPrice,
            gasLimit: '500000'
        };
    
        const amountIn = (await ethers).utils.parseUnits(amount, "ether");

    
       // console.log(Contract)
        try{
          if(coin0.symbol=='BNB'){
            const type ='BNBTOTOKEN'

            console.log('starting')
            const RouterABI = [
              'function swapExactETHForTokens( uint256 amountOutMin, address[] calldata path, address to, uint256 deadline ) external payable virtual returns (uint256[] memory amounts)',
              'function swapExactETHForTokensSupportingFeeOnTransferTokens( uint256 amountOutMin, address[] calldata path, address to, uint256 deadline ) external payable virtual',
            ]
   
            const pancakeRouterContract = new ethers.Contract(addresses.router, RouterABI)
           // const amounts = await router.getAmountsOut(amountIn, [addresses.WBNB, address2]);
            const amountOutMin = await getAmountsOut(amountIn,address1,address2,type)
            

          
            const  nonce  = await provider.getTransactionCount(wallet.address) // get from '/getNonce' route
            const gasLimit = 500000
            const deadline = Math.floor(Date.now() / 1000) + 60 * 10

            
            const unsignedTx = await pancakeRouterContract.populateTransaction.swapExactETHForTokens(
              amountOutMin,
              [addresses.WBNB, address2],
              wallet.address,
              deadline,
              {
                nonce,
                gasPrice,
                gasLimit,
                value: amountIn
              },
            )
          
          
            const signedTx = await wallet.signTransaction(unsignedTx)
           console.log(signedTx)
           const tx = await provider.sendTransaction(signedTx)//SendTransaction(signedTx,token)
          // const txx = await tx.wait()
           console.log(tx)
           if(tx.hash){
             
             

             const type ='Swap'
             try{

               const saveTransaction = await SaveTransaction(type,tx.hash,walletType)
               console.log(saveTransaction)
              // await getCustomBalance()
               alert("Your Tx Hash : "+tx.hash)
                navigation.navigate('Transactions')
              }catch(e){
                alert(e)
                console.log(e)
              }

           }else{
            alert('transaction failed')
           }
          
          }
          else if(coin1.symbol==='BNB'){
            const type ='TOKENTOBNB'
            const approve = await approveSwap(address1,amountIn,decrypt,token)
             console.log(approve)
            console.log('starting swap to bnb')
              const wallet = new ethers.Wallet(PRIVATE_KEY)
            
              const RouterABI = [
                'function swapExactTokensForETH( uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline ) external virtual returns (uint256[] memory amounts)',
                'function swapExactTokensForETHSupportingFeeOnTransferTokens( uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external virtual',
              ]
            
              const pancakeRouterContract = new ethers.Contract(addresses.router, RouterABI)
              
             
              

                const amountsOutMin = await getAmountsOut(amountIn,address1,address2,type)
                
                
                const  nonce  = await provider.getTransactionCount(wallet.address) // get from '/getNonce' route
                // get from '/getNonce' route
                const  gasPrice  = provider.getGasPrice() // get from '/getGasPrice' route
                const gasLimit = 500000
                const DEADLINE = Math.floor(Date.now() / 1000) + 60 * 10
                
                const unsignedTx = await pancakeRouterContract.populateTransaction.swapExactTokensForETH(
                  amountIn,
                  amountsOutMin,
                  [address1, addresses.WBNB],
                  wallet.address,
                  DEADLINE,
                  {
                    nonce,
                    gasPrice,
                    gasLimit,
                  },
                  )
                  
                  const signedTx = await wallet.signTransaction(unsignedTx)
                  console.log(signedTx)
                  const Tx = await provider.sendTransaction(signedTx)//SendTransaction(signedTx,token)
                  //const tx = await sendSignedTx.wait()
                 // console.log(tx.Hash)
                 if(Tx.hash){

                  const type = 'Swap'
                  const saveTransaction = await SaveTransaction(type,Tx.hash,walletType)
                  console.log(saveTransaction)
                  //await getCustomBalance()
                  alert("Your Tx Hash : "+Tx.hash)
                  navigation.navigate('Transactions')                  }
                  else{
                    alert('Swap failed')
                  }
                  
                }
                else{

              
                  const type ='TOKENTOTOKEN'

           
const approve = await approveSwap(address1,amountIn,decrypt,token)
console.log(approve)

  const RouterABI = [
    'function swapExactTokensForTokens( uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external virtual returns (uint256[] memory amounts)',
    'function swapExactTokensForTokensSupportingFeeOnTransferTokens( uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external virtual returns (uint256[] memory amounts)',
  ]

  const pancakeRouterContract = new ethers.Contract(addresses.router, RouterABI)
  const amountsOutMin = getAmountsOut(amountIn,address1,address2,type)

  const  nonce  = await provider.getTransactionCount(wallet.address) // get from '/getNonce' route
                // get from '/getNonce' route
                const  gasPrice  = provider.getGasPrice()
                const gasLimit = 500000
  const DEADLINE = Math.floor(Date.now() / 1000) + 60 * 10

  const unsignedTx = await pancakeRouterContract.populateTransaction.swapExactTokensForTokens(
    amountIn,
    amountsOutMin,
    [address1, address2],
    wallet.address,
    DEADLINE,
    {
      nonce,
      gasPrice,
      gasLimit,
    },
  )

  const signedTx = await wallet.signTransaction(unsignedTx)
  console.log(signedTx)
  const Tx =   await provider.sendTransaction(signedTx)//SendTransaction(signedTx,token)
  console.log(Tx.hash)
  if(Tx.hash){

    const type = 'Swap'
    const saveTransaction = await SaveTransaction(type,Tx.hash,walletType)
    console.log(saveTransaction)
    //await getCustomBalance()
    alert("Your Tx Hash : "+Tx.hash)
    navigation.navigate('Transactions')    }
    else{
      alert('Swap failed')
    }

  
            }
          }catch(e){
            
            console.log(e)
            setLoading(false)
            alert(e)
          }
          setLoading(false)
        
}*/


              