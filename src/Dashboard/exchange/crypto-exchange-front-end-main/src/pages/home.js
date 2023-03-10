import { useState, useEffect } from "react";
import { authRequest, GET, POST } from "../api";
import { NewOfferModal } from "../components/newOffer.modal";
import { FieldView } from "./profile";
import { OfferListView } from "./offers";
import { ConnectToWallet } from "../web3";
import { StyleSheet, Text, View, Button } from "react-native";
import BootstrapStyleSheet from "react-native-bootstrap-styles";
import { useSelector } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { getRegistrationToken } from "../utils/fcmHandler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { REACT_APP_LOCAL_TOKEN } from "../ExchangeConstants";
export const HomeView = (props) => {
  const state = useSelector((state) => state);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState();
  const [profile, setProfile] = useState({
    isVerified: false,
    firstName: "tushant",
    lastName: "chakravarty",
    email: "tushant@gmail.com",
    phoneNumber: "9340079982",
    isEmailVerified: true,
  });
  const [offers, setOffers] = useState();
  const[change, setChange] = useState(false)
  const bootstrapStyleSheet = new BootstrapStyleSheet();
  const { s, c } = bootstrapStyleSheet;
  useEffect(() => {
    fetchProfileData();
    getOffersData();
   // syncDevice()
  }, []);
  useEffect(() => {
    fetchProfileData();
    getOffersData();
   // syncDevice()
  }, [change]);
   const navigation = useNavigation()
  const syncDevice = async () => {
    const token = await getRegistrationToken();
    console.log("hi", token);
    try {
      const { res } = await authRequest(
        `/users/getInSynced/${await getRegistrationToken()}`,
        GET
      );
      if (res.isInSynced) {
        const { err } = await authRequest("/users/syncDevice", POST, {
          fcmRegToken: await getRegistrationToken(),
        });
        if (err) return setMessage(`${err.message}`);
        return setMessage("Your device is synced");
      }

      return setMessage("");
    } catch (err) {
      //console.log(err)
      setMessage(err.message || "Something went wrong");
    }
  };

  const fetchProfileData = async () => {
    try {
      const { res, err } = await authRequest("/users/getUserDetails", GET);
      if (err) return setMessage(` ${err.message}`);
      setProfile(res);
    } catch (err) {
      //console.log(err)
      setMessage(err.message || "Something went wrong");
    }
  };

  const getOffersData = async () => {
    try {
      const { res, err } = await authRequest("/offers", GET);
      if (err) return setMessage(`${err.message}`);
      setOffers(res);
    } catch (err) {
      // console.log(err)
      setMessage(err.message || "Something went wrong");
    }
  };

  const applyForKyc = async () => {
    try {
      const { err } = await authRequest("/users/kyc", POST);
      if (err) return setMessage(`${err.message}`);

      await fetchProfileData();
      return setMessage("KYC success");
    } catch (err) {
      // console.log(err)
      setMessage(err.message || "Something went wrong");
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.container}>
          {message ? <Text>{message}</Text> : <Text>No Messages!</Text>}
        </View>
        <View style={styles.container}>
          {state.wallet ? (
            <View>
              <Text>Wallet Connected</Text>
              <Text>{state.wallet.address}</Text>
            </View>
          ) : (
            <ConnectToWallet setMessage={setMessage} />
          )}
        </View>
        <Text style={styles.container}>Actions</Text>
        {profile && (
          <View style={styles.container}>
            <FieldView
              title="KYC Status"
              value={profile.isVerified}
              applyForKyc={applyForKyc}
              type="kyc"
            />
            <View style={styles.container}>
              {profile.isVerified ? (
                <>
                  <Button
                    title="offer"
                    color={"green"}
                    onPress={() => setOpen(true)}
                  ></Button>
                  <View 
                  style={{marginTop:10}}
                  >

                  <Button
                  
                  title="logout"
                  color='red'
                  onPress={()=>{
                    const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
                    AsyncStorage.removeItem(LOCAL_TOKEN);
                    navigation.navigate("Settings");
                  }}
                  ></Button>
                  </View>
                  <NewOfferModal
                    user={profile}
                    open={open}
                    setOpen={setOpen}
                    getOffersData={getOffersData}
                  />
                </>
              ) : (
                <Text>Please do KYC to start adding offers</Text>
              )}
            </View>
          </View>
        )}
        <View style={styles.container}>
          <Text>Your Offers</Text>

          <OfferListView self={true} profile={profile} offers={offers} setChange={setChange}/>
        </View>
        <View style={{ marginTop: offers ? hp(36) : 0 }}>
          <Text>Your Bids</Text>
        </View>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
    margin: 5,
  },
});
