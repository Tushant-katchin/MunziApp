const xrpl = require("xrpl");
import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
} from "react-native";
import { TextInput, Checkbox } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AddToAllWallets } from "../../components/Redux/actions/auth";
import { urls } from "../constants";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import "@ethersproject/shims";
import { ethers } from "ethers";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";

const ImportXrpWalletModal = ({
  props,
  setWalletVisible,
  Visible,
  setModalVisible,
}) => {
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [visible, setVisible] = useState(false);
  const [Wallet, setWallet] = useState();
  const [label, setLabel] = useState("mnemonic");
  const [privateKey, setPrivateKey] = useState();
  const [optionVisible, setOptionVisible] = useState(false);
  const [provider, setProvider] = useState("");
  const navigation = useNavigation()
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const Spin = new Animated.Value(0);

  async function saveUserDetails(address) {
    let response;
    const user = await AsyncStorageLib.getItem("user");
    console.log(user);
    const token = await AsyncStorageLib.getItem("token");
    try {
      response = await fetch(`http://${urls.testUrl}/user/saveUserDetails`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          user: user,
          walletAddress: address,
          accountName: accountName,
        }),
      })
        .then((response) => response.json())
        .then(async (responseJson) => {
          if (responseJson.responseCode === 200) {
            alert("success");
            return responseJson.responseCode;
          } else if (responseJson.responseCode === 400) {
            alert(
              "account with same name already exists. Please use a different name"
            );
            return responseJson.responseCode;
          } else {
            alert("Unable to create account. Please try again");
            return 401;
          }
        })
        .catch((error) => {
          alert(error);
        });
    } catch (e) {
      console.log(e);
      alert(e);
    }
    console.log(response);
    return response;
  }

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();

    Animated.timing(Spin, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, Spin]);

  return (
    <Animated.View // Special animatable View
      style={{ opacity: fadeAnim }}
    >
      <Modal
        animationIn="slideInRight"
        animationOut="slideOutRight"
        animationInTiming={500}
        animationOutTiming={650}
        isVisible={Visible}
        useNativeDriver={true}
        statusBarTranslucent={true}
        onBackdropPress={() => setWalletVisible(false)}
        onBackButtonPress={() => {
          setWalletVisible(false);
        }}
      >
        <View style={style.Body}>
          <View style={style.Button}>
            <View style={{ margin: 2, width: wp(30), marginLeft: wp(15) }}>
              <Button
                title={"Mnemonic"}
                color={label == "mnemonic" ? "green" : "grey"}
                onPress={() => {
                  setOptionVisible(false);
                  setLabel("mnemonic");
                }}
              ></Button>
            </View>
            <View style={{ margin: 2, width: wp(30) }}>
              <Button
                title={"privateKey"}
                color={label == "privateKey" ? "green" : "grey"}
                onPress={() => {
                  setLabel("privateKey");
                  setOptionVisible(true);
                }}
              ></Button>
            </View>
          </View>

          <View style={{ display: "flex", alignContent: "flex-start" }}>
            <Text style={style.welcomeText}>Name</Text>
          </View>
          <TextInput
            style={style.input2}
            theme={{ colors: { text: "black" } }}
            value={accountName}
            onChangeText={(text) => {
              setAccountName(text);
            }}
            placeholderTextColor="black"
            autoCapitalize={"none"}
            placeholder="Wallet 1"
          />

          <TextInput
            style={style.textInput}
            onChangeText={(text) => {
              if (label === "mnemonic") {
                setMnemonic(text);
              } else if (label === "privateKey") {
                setPrivateKey(text);
              } else {
                return alert(`please input ${label} to proceed `);
              }
            }}
            placeholder={
              label === "privateKey"
                ? "Enter your private Key here"
                : label === "JSON"
                ? "Enter your secret JSON Key here"
                : "Enter your secret phrase here"
            }
          />

          {loading ? (
            <ActivityIndicator size="large" color="green" />
          ) : (
            <Text> </Text>
          )}
          <View style={{ width: wp(90), margin: 10 }}>
            <Button
              title={"Import"}
              color={"blue"}
              onPress={async () => {
                const user = await AsyncStorageLib.getItem("user");
                if (!accountName) {
                  return alert("please enter an accountName to proceed");
                }
                setLoading(true);
                if (label === "mnemonic") {
                  try {
                    console.log('mnemonic'+ mnemonic)
                    /*Wallet {
  "classicAddress": "rBF6yd1gkfBQ4DbgjjFb8eG2QNPHYGgyZH",
  "privateKey": "ED3C6A54C6B61A02CF1739FAA2E1D7CD2384CFB23ABE5B8C6C94E13552E196FA5C",
  "publicKey": "ED79A51B1B6CA6701A10143380A7B6520A23F900AE21F8CE2877BE62DAA84A7F17",
  "seed": "sEdTB7KBmtuNsMqGK5rTbUkgi5GXzWb",
} */
                    const phrase = mnemonic.trimStart();
                    const trimmedPhrase = phrase.trimEnd();
                    const accountFromMnemonic =
                      xrpl.Wallet.fromSeed(trimmedPhrase);
                    const privateKey = accountFromMnemonic.seed;
                    const wallet = {
                      classicAddress: accountFromMnemonic.classicAddress,
                      address: accountFromMnemonic.publicKey,
                      privateKey: privateKey,
                    };
                    /* const response = await saveUserDetails(wallet.address).then(async (response)=>{
                      if(response===400){
                        return 
                      }
                     else if(response===401){
                        return 
                      }
                    }).catch((e)=>{
                      console.log(e)
                      setLoading(false)
                      setWalletVisible(false)
                      setVisible(false)
                      setModalVisible(false)


                    })*/
                    const accounts = {
                      classicAddress: wallet.classicAddress,
                      address: wallet.address,
                      privateKey: privateKey,
                      name: accountName,
                      wallets: [],
                    };
                    let wallets = [];
                    const data = await AsyncStorageLib.getItem(
                      `${user}-wallets`
                    )
                      .then((response) => {
                        console.log(response);
                        JSON.parse(response).map((item) => {
                          wallets.push(item);
                        });
                      })
                      .catch((e) => {
                        setWalletVisible(false);
                        setVisible(false);
                        setModalVisible(false);
                        console.log(e);
                      });

                    //wallets.push(accounts)
                    const allWallets = [
                      {
                        classicAddress: wallet.classicAddress,
                        address: wallet.address,
                        privateKey: privateKey,
                        name: accountName,
                        walletType: "Xrp",
                        wallets: wallets,
                      },
                    ];
                    // AsyncStorageLib.setItem(`${accountName}-wallets`,JSON.stringify(wallets))

                    dispatch(AddToAllWallets(allWallets, user));
                    // dispatch(getBalance(wallet.address))
                    //dispatch(setProvider('https://data-seed-prebsc-1-s1.binance.org:8545'))

                    let result = [];

                    setLoading(false);
                    setWalletVisible(false);
                    setVisible(false);
                    setModalVisible(false);
                    navigation.navigate("AllWallets");
                  } catch (e) {
                    console.log(e);
                    alert(e);
                    setLoading(false);
                    setWalletVisible(false);
                    setVisible(false);
                    setModalVisible(false);
                  }
                } else {
                  try {
                    console.log("hi"+privateKey)
                    const walletPrivateKey = xrpl.Wallet.fromSecret(privateKey);
                    console.log(walletPrivateKey);
                    const privatekey = walletPrivateKey.seed;
                    const wallet = {
                      address: walletPrivateKey.publicKey,
                      privateKey: privatekey,
                      classicAddress: walletPrivateKey.classicAddress,
                    };
                    /* const response = await saveUserDetails(wallet.address).then(async (response)=>{
                      
                      if(response===400){
                        return 
                      }
                     else if(response===401){
                        return 
                      }
                    }).catch((e)=>{
                      console.log(e)
                      setLoading(false)
                      setWalletVisible(false)
                      setVisible(false)
                      setModalVisible(false)


                    })*/
                    const accounts = {
                      classicAddress: wallet.classicAddress,
                      address: wallet.address,
                      privateKey: privateKey,
                      name: accountName,
                      wallets: [],
                    };
                    let wallets = [];
                    const data = await AsyncStorageLib.getItem(
                      `${user}-wallets`
                    )
                      .then((response) => {
                        console.log(response);
                        JSON.parse(response).map((item) => {
                          wallets.push(item);
                        });
                      })
                      .catch((e) => {
                        setWalletVisible(false);
                        setVisible(false);
                        setModalVisible(false);
                        console.log(e);
                      });

                    //wallets.push(accounts)
                    const allWallets = [
                      {
                        classicAddress: wallet.classicAddress,
                        address: wallet.address,
                        privateKey: privateKey,
                        name: accountName,
                        walletType: "Xrp",
                        wallets: wallets,
                      },
                    ];
                    // AsyncStorageLib.setItem(`${accountName}-wallets`,JSON.stringify(wallets))

                    dispatch(AddToAllWallets(allWallets, user));
                    // dispatch(getBalance(wallet.address))
                    //dispatch(setProvider('https://data-seed-prebsc-1-s1.binance.org:8545'))

                    let result = [];

                    setLoading(false);
                    setWalletVisible(false);
                    setVisible(false);
                    setModalVisible(false);
                    navigation.navigate("AllWallets");
                  } catch (e) {
                    console.log(e);
                    setLoading(false);
                    setWalletVisible(false);
                    setVisible(false);
                    setModalVisible(false);
                    alert(e);
                  }
                }

                setWalletVisible(false);
                setVisible(false);
                setModalVisible(false);
                setLoading(false);
              }}
            ></Button>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

export default ImportXrpWalletModal;

const style = StyleSheet.create({
  Body: {
    display: "flex",
    backgroundColor: "white",
    height: hp(90),
    width: wp(100),
    textAlign: "center",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },

  welcomeText: {
    fontSize: 15,
    fontWeight: "200",
    color: "black",
    marginLeft: 10,
  },
  welcomeText2: {
    fontSize: 15,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
  },
  Button: {
    marginTop: hp(0),
    display: "flex",
    flexDirection: "row",
    alignContent: "space-around",
    alignItems: "center",
  },
  tinyLogo: {
    width: wp("5"),
    height: hp("5"),
    padding: 30,
    marginTop: hp(10),
  },
  Text: {
    marginTop: hp(5),
    fontSize: 15,
    fontWeight: "200",
    color: "white",
  },
  input: {
    height: hp("5%"),
    marginBottom: hp("2"),
    color: "black",
    marginTop: hp("2"),
    width: wp("90"),
    paddingRight: wp("7"),
    backgroundColor: "white",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "grey",
    height: hp(20),
    width: wp(90),
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },
  input2: {
    borderWidth: 1,
    borderColor: "grey",
    height: hp(5),
    width: wp(90),
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },
});
