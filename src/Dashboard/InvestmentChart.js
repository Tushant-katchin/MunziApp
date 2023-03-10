import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Button } from "react-native";
import {
  Avatar,
  Card,
  Title,
  Paragraph,
  CardItem,
  WebView,
} from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import Etherimage from "../../assets/ethereum.png";
import { Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import { LocalNotification } from "./notifications/pushController";
function InvestmentChart() {
  const state2 = useSelector((state) => state.walletBalance);

  const state = useSelector((state) => state);
  const wallet = useSelector((state) => state.wallet);
  const [bnbBalance, getBnbBalance] = useState(0);
  const [ethBalance, getEthBalance] = useState(0);

  if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const translation = useRef(new Animated.Value(0)).current;

  useEffect(async () => {
    /*Animated.timing(
    fadeAnim,
    {
      toValue: 1,
      duration: 1000,
    }
  ).start();

Animated.timing(translation, {
    toValue: 1,
    delay: 0.1,
    useNativeDriver: true,
  }).start();  */
    const bal = await state.walletBalance;
    const EthBalance = await state.EthBalance;
    if (bal) {
      getBnbBalance(bal);
    } else {
      getBnbBalance(0.0);
    }
    if (EthBalance) {
      getEthBalance(0.0);
    } else {
      getEthBalance(0.0);
    }
    //LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [state2]);

  useEffect(async () => {
    const bal = await state.walletBalance;
    const EthBalance = await state.EthBalance;
    if (bal) {
      getBnbBalance(bal);
    } else {
      getBnbBalance(0.0);
    }
    if (EthBalance) {
      getEthBalance(EthBalance);
    } else {
      getEthBalance(0.0);
    }
    //LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [wallet]);

  let LeftContent = (props) => (
    <Avatar.Image
      {...props}
      source={{
        uri: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850",
      }}
    />
  );
  let LeftContent2 = (props) => <Avatar.Image {...props} source={Etherimage} />;

  return (
    <View style={{ display: "flex", flexDirection: "column", marginTop: 5 }}>
      <Card
        style={{
          width: wp(95),
          height: hp(10),
          backgroundColor: "white",
          borderRadius: 10,
          marginLeft: 5,
        }}
      >
        <Card.Title
          titleStyle={{ color: "black", fontSize: 15, marginBottom: 23 }}
          title={"BNB Coin"}
          left={LeftContent}
        />
        <Card.Content
          style={{ display: "flex", flexDirection: "row", color: "black" }}
        >
          <Title style={{ color: "black" }}></Title>
          <Paragraph
            style={{
              color: "black",
              marginLeft: wp("50"),
              fontWeight: "bold",
              top: -50,
              left: 50,
            }}
          >
            {bnbBalance ? bnbBalance : 0} BNB
          </Paragraph>
          <Paragraph
            style={{
              color: "grey",
              position: "absolute",
              marginLeft: wp("20"),
              fontWeight: "bold",
              top: -39,
            }}
          >
            $300
          </Paragraph>
        </Card.Content>
      </Card>

      <Card
        style={{
          width: wp(95),
          height: hp(10),
          backgroundColor: "white",
          borderRadius: 10,
          marginLeft: 5,
        }}
      >
        <Card.Title
          titleStyle={{ color: "black", fontSize: 15, marginBottom: 23 }}
          title={"Ethereum"}
          left={LeftContent2}
        />
        <Card.Content
        
          style={{ display: "flex", flexDirection: "row", color: "black" }}
        >
          <Title style={{ color: "black" }}></Title>
          <Paragraph
            style={{
              color: "black",
              marginLeft: wp("50"),
              fontWeight: "bold",
              top: -50,
              left: 50,
            }}
          >
            {ethBalance ? ethBalance : 0} ETH
          </Paragraph>
          <Paragraph
            style={{
              color: "grey",
              position: "absolute",
              marginLeft: wp("20"),
              fontWeight: "bold",
              top: -39,
            }}
          >
            $1300
          </Paragraph>
        </Card.Content>
      </Card>
      <Button title="notification" color="blue" onPress={()=>{
        LocalNotification()
      }} />
    </View>
  );
}

export default InvestmentChart;

const styles = StyleSheet.create({
  view: {
    flex: 1,
    height: 75,
  },
  chart: {
    height: 75,
  },
  priceUp: {
    color: "rgb(0,153,51)",
  },
  priceDown: {
    color: "rgb(204,51,51)",
  },
});
