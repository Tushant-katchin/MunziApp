import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Card,
  Title,
  Paragraph,
  CardItem,
  WebView,
} from "react-native-paper";
import Bnbimage from "../../../assets/bnb-icon2_2x.png";
import Etherimage from "../../../assets/ethereum.png";
import maticImage from "../../../assets/matic.png";
import Modal from "react-native-modal";
import RecieveAddress from "./ReceiveAddress";
//'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850'
const RecieveModal = ({ modalVisible, setModalVisible }) => {
  const [visible, setVisible] = useState(false);
  const [iconType, setIconType] = useState("");
  const dispatch = useDispatch();

  let EtherLeftContent = (props) => (
    <Avatar.Image {...props} source={Etherimage} />
  );
  let BnbLeftContent = (props) => <Avatar.Image {...props} source={Bnbimage} />;
  let maticLeftContent = (props) => (
    <Avatar.Image {...props} source={maticImage} />
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const Spin = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View // Special animatable View
      style={{ opacity: fadeAnim }}
    >
      <Modal
        animationIn="slideInUp"
        animationOut="slideOutRight"
        animationInTiming={500}
        animationOutTiming={650}
        isVisible={modalVisible}
        useNativeDriver={true}
        onModalHide={() => setModalVisible(false)}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => {
          setModalVisible(false);
        }}
      >
        <View style={style.Body}>
          <TouchableOpacity
            style={style.Box3}
            onPress={() => {
              setTimeout(() => {
                setVisible(true);
              }, 0);

              setIconType("BNB");
            }}
          >
            <Card
              style={{
                width: wp(90),
                height: hp(10),
                backgroundColor: "white",
                borderRadius: 10,
              }}
            >
              <Card.Title
                titleStyle={{ color: "black" }}
                title={"BNB"}
                left={BnbLeftContent}
              />
              <Card.Content
                style={{ display: "flex", flexDirection: "row", color: "#fff" }}
              >
                <Title style={{ color: "#fff" }}></Title>
              </Card.Content>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity
            style={style.Box2}
            onPress={() => {
              setTimeout(() => {
                setVisible(true);
              }, 1);
              setIconType("ETH");
            }}
          >
            <Card
              style={{
                width: wp(90),
                height: hp(10),
                backgroundColor: "white",
                borderRadius: 10,
              }}
            >
              <Card.Title
                titleStyle={{ color: "black" }}
                title={"Ethereum"}
                left={EtherLeftContent}
              />
              <Card.Content
                style={{ display: "flex", flexDirection: "row", color: "#fff" }}
              >
                <Title style={{ color: "#fff" }}></Title>
              </Card.Content>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={style.Box2}
            onPress={() => {
              setTimeout(() => {
                setVisible(true);
              }, 1);
              setIconType("Matic");
            }}
          >
            <Card
              style={{
                width: wp(90),
                height: hp(10),
                backgroundColor: "white",
                borderRadius: 10,
              }}
            >
              <Card.Title
                titleStyle={{ color: "black" }}
                title={"Matic"}
                left={maticLeftContent}
              />
              <Card.Content
                style={{ display: "flex", flexDirection: "row", color: "#fff" }}
              >
                <Title style={{ color: "#fff" }}></Title>
              </Card.Content>
            </Card>
          </TouchableOpacity>

          <Text>Please select a wallet type</Text>
        </View>

        <RecieveAddress
          modalVisible={visible}
          setModalVisible={setVisible}
          iconType={iconType}
        />
      </Modal>
    </Animated.View>
  );
};

export default RecieveModal;

const style = StyleSheet.create({
  Body: {
    display: "flex",
    backgroundColor: "white",
    height: hp(83),
    width: wp(90),
    alignItems: "center",
    textAlign: "center",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    borderBottomEndRadius: 10,
    borderBottomLeftRadius: 10,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "200",
    color: "black",
    marginTop: hp(5),
  },
  welcomeText2: {
    fontSize: 15,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
  },
  Button: {
    marginTop: hp(10),
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
    width: wp("70"),
    paddingRight: wp("7"),
    backgroundColor: "white",
  },
  Box: {
    height: hp("15%"),
    width: wp("75"),
    fontSize: 20,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
    display: "flex",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: "white",
  },
  Box2: {
    height: hp("15%"),
    width: wp("75"),
    fontSize: 20,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
    display: "flex",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: "white",
  },
  Box3: {
    height: hp("15%"),
    width: wp("75"),
    fontSize: 20,
    fontWeight: "200",
    color: "white",
    marginTop: hp(2),
    display: "flex",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: "white",
    borderTopWidth: 1,
  },
});
