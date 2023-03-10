import React, { useState, useEffect } from "react";
import { Animated, StyleSheet, TextInput } from "react-native";
import { Dimensions } from "react-native";

const deviceWidth = Dimensions.get("window").width;
const SearchComponent = (props) => {
  const { clampedScroll, setSearch, data, setData } = props;
  const searchBarTranslate = clampedScroll.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -250],
    extrapolate: "clamp",
  });
  const searchBarOpacity = clampedScroll.interpolate({
    inputRange: [0, 10],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const handleSearch = (text) => {
    const formattedQuery = text.toLowerCase();

    if (data) {
      const Data = data.filter((item) => {
        if (item.name) {
          const name = `${item.name.toLowerCase()}`;
          console.log(name);

          if (name) {
            return name.includes(formattedQuery) ? item : null;
          }
        }
      });
      setData(Data);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: searchBarTranslate,
            },
          ],
          opacity: searchBarOpacity,
        },
      ]}
    >
      <TextInput
        placeholder="Search"
        style={styles.formField}
        placeholderTextColor={"#888888"}
        onChangeText={(text) => {
          setSearch(text);

          if (text) {
            handleSearch(text);
          } else {
            setData(data);
          }
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    width: deviceWidth - 40,
    left: 20,
    zIndex: 99,
    backgroundColor: "white",
  },
  formField: {
    borderWidth: 1,
    padding: 12,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 20,
    borderColor: "#888888",
    fontSize: 18,
    height: 50,
  },
});

export default SearchComponent;
