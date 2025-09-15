import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

const Loader = ({ visible = false }) => {
    if (!visible) return null;
    console.log("Loader visible:", visible);


    return (
        <View style={styles.container}>
            <LottieView
                source={require("../../Assets/animations/loading.json")}
                autoPlay
                loop
                style={styles.animation}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    animation: {
        width: 250,
        height: 250,
    },


});

export default Loader;
