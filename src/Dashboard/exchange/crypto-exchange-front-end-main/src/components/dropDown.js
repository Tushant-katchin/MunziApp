import { Dropdown } from 'react-native-element-dropdown';
import { StyleSheet, Text, View, Image, TextInput, FlatList, TouchableOpacity, Alert, LayoutAnimation, Platform, UIManager  } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import AsyncStorageLib from '@react-native-async-storage/async-storage';


export const DropDown =({Title,dropdownData,setNewOffer, newOffer})=>{
    const state =  useSelector( (state) =>  state)
   const [value, setValue] = useState(null);
   const [value2, setValue2] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const renderLabel = () => {
      if (value || isFocus) {
        return (
          <Text style={[styles.label, isFocus && { color: 'blue' }]}>
            Dropdown label
          </Text>
        );
      }
      return null;
    };

    
    return(
        <View style={styles.container}>
            
        <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={dropdownData}
        search
        maxHeight={200}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ?Title:Title==='Choose Asset'? 'Assets':Title==='Choose Currency'?'Currencies':'Select'}
        searchPlaceholder="Search..."
        value={Title==='Choose Asset'?value:value2}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(input)=>{
          let type
          if(Title==='Choose Asset'){
            type ='amount'
           // setNewOffer(newOffer)
           const assetName ={
            amount: newOffer.amount,
            assetName: input.value,
            pricePerUnit: newOffer.pricePerUnit,
            currencyName: newOffer.currencyName? newOffer.currencyName:'',

           }
            setNewOffer(assetName)
            setValue(input.value)
          }else if(Title ==='Choose Currency'){
            type = 'pricePerUnit'
            const assetName ={
              amount: newOffer.amount,
              assetName: newOffer.assetName? newOffer.assetName:'',
              pricePerUnit: newOffer.pricePerUnit,
              currencyName: input.value,
  
             }
            setNewOffer(assetName)
            setValue2(input.value)
           
          }
         
        }}
        
       
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? 'blue' : 'white'}
            name="Safety"
            size={20}
          />
        )}
      />
    </View>
     
    )
}

const styles=StyleSheet.create({
    text:{
  bottom:wp('35'),
  color:'white'
    },
    textDesign:{
  color:'white',
  fontStyle:'italic',
  fontWeight:'bold',
  marginLeft:wp('3')
    },
    textDesign2:{
      color:'white',
      fontWeight:'bold',
      marginLeft:wp('5')
        },
        textDesign3:{
          color:'white',
          fontWeight:'bold',
          marginLeft:wp('2')
            },
            textDesign4:{
              color:'white',
              fontWeight:'bold',
              marginLeft:wp('4')
                },
    buttons:{
      display:'flex',
      flexDirection:'row',
      justifyContent:'space-evenly',
      bottom:hp('16')
    },
    addButton: {
      display:'flex',
      paddingLeft:wp('4'),
      opacity:0.8,
      alignItems:'center',
      textAlign:'center',
      zIndex: 11,
      backgroundColor: 'grey',
      width: wp('15'),
      height: hp('6'),
      borderRadius: 45,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
    },
    addButton2: {
      position: 'absolute',
      zIndex: 11,
      left: 20,
      bottom: 90,
      backgroundColor: 'green',
      width: 80,
      height: 70,
      borderRadius: 35,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 18,
    },
    container: {
      backgroundColor: 'white',
      color:'black'
    },
    dropdown: {
      height: hp('7'),
      width:wp('40'),
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
      marginTop:hp('1'),
    },
    icon: {
      marginRight: 5,
      backgroundColor:'blue'
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: wp('13'),
      zIndex: -999,
      paddingHorizontal: 8,
      fontSize: 14,
      color:'black',
      height:hp('3'),
      bottom:hp('8')
    },
    placeholderStyle: {
      fontSize: 16,
      color:'black'
    },
    selectedTextStyle: {
      fontSize: 11,
      color:'black'
    },
    iconStyle: {
      width: 20,
      height: 20,
      backgroundColor:'blue'
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
  
  
  })
  