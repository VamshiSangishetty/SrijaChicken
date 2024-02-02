import { StyleSheet } from "react-native";

const styles=StyleSheet.create({
page:{
    flex:1,
   margin:16,
   marginVertical:0
},
title:{
fontSize:20,
fontWeight:"bold",
},
picker: {
    width: 200,
    alignSelf:"center"
  },
  
  weight:{
    fontSize:18,
    marginTop:10,
    fontWeight:"500"
  },
  price:{
    fontSize:20,
    fontWeight:"bold",
    marginVertical:12
  },
  description:{
    marginVertical:15,
    fontSize:16,
fontWeight:"400" ,
lineHeight:26,
 },
 image: {
    marginTop:10,
    width: "100%",
    height: 189,
    borderRadius:18
  },
});

export default styles;