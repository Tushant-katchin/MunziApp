import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { HomeView } from "./pages/home";
import { ProfileView } from "./pages/profile";
import { OfferView } from "./pages/offers";
import { getAuth } from "./api";
import { AccountView } from "./pages/account";
import { TransactionView } from "./pages/transaction";
import { NativeRouter, Route, Link, Routes } from "react-router-native";
import { OnScreenNotification } from './components/onScreenNotification'
import {
  onMessageListener,
  requestFirebaseNotificationPermission,
} from './utils/fcmHandler'
const Home = () => {
  return (
    <View>
      <Text>Home</Text>
    </View>
  );
};
const Exchange = ({ pressed, setPressed }) => (
  <NativeRouter>
    <View style={styles.container}>
      <View style={styles.nav}>
        <Link
          to="/"
          underlayColor="grey"
          onShowUnderlay={() => setPressed("1")}
          style={{
            flex: 1,
            alignItems: "center",
            padding: 10,
            backgroundColor: pressed === "1" ? "grey" : "white",
            borderRadius: 20,
          }}
        >
          <Text>Home</Text>
        </Link>
        <Link
          to="/offers"
          underlayColor="#f0f4f7"
          style={{
            flex: 1,
            alignItems: "center",
            padding: 10,
            backgroundColor: pressed === "2" ? "grey" : "white",
            borderRadius: 20,
          }}
          onShowUnderlay={() => setPressed("2")}
        >
          <Text>offers</Text>
        </Link>
        <Link
          to="/profile"
          underlayColor="#f0f4f7"
          style={{
            flex: 1,
            alignItems: "center",
            padding: 10,
            backgroundColor: pressed === "3" ? "grey" : "white",
            borderRadius: 20,
          }}
          onShowUnderlay={() => setPressed("3")}
        >
          <Text>profile</Text>
        </Link>
        <Link
          to="/Transactions"
          underlayColor="#f0f4f7"
          style={{
            flex: 1,
            alignItems: "center",
            padding: 10,
            backgroundColor: pressed === "4" ? "grey" : "white",
            borderRadius: 20,
          }}
          onShowUnderlay={() => setPressed("4")}
        >
          <Text>Tx's</Text>
        </Link>
        <Link
          to="/account"
          underlayColor="#f0f4f7"
          style={{
            flex: 1,
            alignItems: "center",
            padding: 10,
            backgroundColor: pressed === "5" ? "grey" : "white",
            borderRadius: 20,
          }}
          onShowUnderlay={() => setPressed("5")}
        >
          <Text>account</Text>
        </Link>
      </View>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/offers" element={<OfferView />} />
        <Route path="/profile" element={<ProfileView />} />
        <Route path="/Transactions" element={<TransactionView />} />
        <Route path="/account" element={<AccountView />} />
      </Routes>
    </View>
  </NativeRouter>
);

const ExchangeRoutes = () => {
  const [pressed, setPressed] = useState();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    
    requestFirebaseNotificationPermission();
  }, []);

  onMessageListener()
  .then((payload) => {
    console.log('Notification', payload) //test...
    setNotification(payload.data)
  })
  .catch((err) => console.log('recieve failed: ', err))

  return (
    <View style={{ backgroundColor: "white" }}>
      {notification && (
        <OnScreenNotification
          notification={notification}
          setNotification={setNotification}
        />
      )}
      <Exchange pressed={pressed} setPressed={setPressed} />
    </View>
  );

};
export default ExchangeRoutes;
const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    padding: 10,
  },
  header: {
    fontSize: 20,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  subNavItem: {
    padding: 5,
  },
  topic: {
    textAlign: "center",
    fontSize: 15,
  },
});
