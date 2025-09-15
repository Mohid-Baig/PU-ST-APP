import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar,
    Animated,
    Alert,
    PermissionsAndroid,
    Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import CustomModal from '../../Components/Customs/CustomModal';
import useModal from '../../Components/Customs/UseModalHook';
import { useUpdateProfileMutation } from '../../Redux/apiSlice';
import { useSelector } from "react-redux";
import FastImage from 'react-native-fast-image';

const { width, height } = Dimensions.get('window');

const EditProfileScreen = ({ navigation, route }) => {
    const { profile } = route.params || {};
    const [formData, setFormData] = useState({
        fullName: profile?.fullName || '',
        uniId: profile?.uniId || '',
        email: profile?.email || '',
    });
    const [profileImage, setProfileImage] = useState(profile?.profileImageUrl ? { uri: profile.profileImageUrl } : null);
    const [uniCardImage, setUniCardImage] = useState(profile?.uniCardImageUrl ? { uri: profile.uniCardImageUrl } : null);
    const [isLoading, setIsLoading] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const {
        modalConfig,
        showModal,
        hideModal,
        showError,
        showSuccess,
    } = useModal();
    const [updateProfile] = useUpdateProfileMutation();
    const token = useSelector((state) => state.auth.token);

    useEffect(() => {
        startAnimations();
    }, []);

    const startAnimations = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        const { fullName, uniId, email } = formData;
        if (!fullName.trim()) {
            showError('Please enter your full name');
            return false;
        }
        if (!uniId.trim()) {
            showError('Please enter your university ID');
            return false;
        }
        if (!email.trim()) {
            showError('Please enter your email address');
            return false;
        }
        if (!email.includes('@') || !email.includes('.')) {
            showError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleImagePicker = async (imageType) => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            quality: 0.8,
        };
        showModal({
            title: 'Select Image',
            message: 'Choose how you want to add your image',
            type: 'info',
            showButtons: true,
            onOk: async () => {
                hideModal();
                if (Platform.OS === 'android') {
                    try {
                        const granted = await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.CAMERA,
                            {
                                title: 'Camera Permission',
                                message: 'This app needs access to your camera',
                                buttonNeutral: 'Ask Me Later',
                                buttonNegative: 'Cancel',
                                buttonPositive: 'OK',
                            }
                        );
                        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                            launchCamera(options, handleCameraResponse(imageType));
                        } else {
                            showError('Camera permission denied');
                        }
                    } catch (err) {
                        console.warn(err);
                        showError('Error requesting camera permission');
                    }
                } else {
                    launchCamera(options, handleCameraResponse(imageType));
                }
            },
            onCancel: () => {
                hideModal();
                launchImageLibrary(options, handleLibraryResponse(imageType));
            },
            okText: 'Camera',
            cancelText: 'Gallery',
        });
    };

    const handleCameraResponse = (imageType) => (response) => {
        if (response.didCancel) {
            return;
        } else if (response.error) {
            Alert.alert('Error', 'Camera error: ' + response.error);
            return;
        } else if (response.assets && response.assets[0]) {
            if (imageType === 'profile') {
                setProfileImage(response.assets[0]);
            } else {
                setUniCardImage(response.assets[0]);
            }
        }
    };

    const handleLibraryResponse = (imageType) => (response) => {
        if (response.didCancel) {
            return;
        } else if (response.error) {
            Alert.alert('Error', 'Gallery error: ' + response.error);
            return;
        } else if (response.assets && response.assets[0]) {
            if (imageType === 'profile') {
                setProfileImage(response.assets[0]);
            } else {
                setUniCardImage(response.assets[0]);
            }
        }
    };

    const handleUpdateProfile = async () => {
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('fullName', formData.fullName);
            formDataToSend.append('uniId', formData.uniId);
            formDataToSend.append('email', formData.email);

            if (profileImage && profileImage.uri) {
                formDataToSend.append('profileImage', {
                    uri: profileImage.uri,
                    type: 'image/jpeg',
                    name: profileImage.fileName || 'profile.jpg'
                });
            }

            if (uniCardImage && uniCardImage.uri) {
                formDataToSend.append('uniCardImage', {
                    uri: uniCardImage.uri,
                    type: 'image/jpeg',
                    name: uniCardImage.fileName || 'unicard.jpg'
                });
            }

            console.log(formDataToSend, 'Form Data to be sent');

            const response = await updateProfile({
                token,
                data: formDataToSend
            }).unwrap();

            showSuccess('Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Profile update error:', error);
            showError(error.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#1e3a8a" barStyle="light-content" />
            <LinearGradient
                colors={['#1e3a8a', '#1e40af', '#3b82f6']}
                style={styles.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.formContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Icon name="person" size={20} color="#64748b" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Full Name"
                                placeholderTextColor="#94a3b8"
                                value={formData.fullName}
                                onChangeText={(text) => updateFormData('fullName', text)}
                                autoCapitalize="words"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Icon name="badge" size={20} color="#64748b" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="University ID"
                                placeholderTextColor="#94a3b8"
                                value={formData.uniId}
                                onChangeText={(text) => updateFormData('uniId', text)}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Icon name="email" size={20} color="#64748b" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Email Address"
                                placeholderTextColor="#94a3b8"
                                value={formData.email}
                                onChangeText={(text) => updateFormData('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    <View style={styles.uploadSection}>
                        <Text style={styles.uploadTitle}>Profile Picture</Text>
                        <TouchableOpacity
                            style={styles.imageUploadContainer}
                            onPress={() => handleImagePicker('profile')}
                            activeOpacity={0.7}
                        >
                            {profileImage ? (
                                <FastImage
                                    source={{ uri: profileImage.uri }}
                                    style={styles.uploadedImage}
                                />
                            ) : (
                                <View style={styles.uploadPlaceholder}>
                                    <Icon name="add-a-photo" size={40} color="#64748b" />
                                    <Text style={styles.uploadText}>Add Profile Picture</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.uploadSection}>
                        <Text style={styles.uploadTitle}>University Card</Text>
                        <TouchableOpacity
                            style={styles.cardUploadContainer}
                            onPress={() => handleImagePicker('card')}
                            activeOpacity={0.7}
                        >
                            {uniCardImage ? (
                                <FastImage
                                    source={{ uri: uniCardImage.uri }}
                                    style={styles.uploadedCardImage}
                                />
                            ) : (
                                <View style={styles.uploadPlaceholder}>
                                    <Icon name="credit-card" size={40} color="#64748b" />
                                    <Text style={styles.uploadText}>Add University Card</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.updateButton, isLoading && styles.updateButtonDisabled]}
                        onPress={handleUpdateProfile}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={isLoading ? ['#94a3b8', '#64748b'] : ['#1e40af', '#3b82f6']}
                            style={styles.updateButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {isLoading ? (
                                <Text style={styles.updateButtonText}>Updating...</Text>
                            ) : (
                                <Text style={styles.updateButtonText}>Update Profile</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            <CustomModal
                {...modalConfig}
                onClose={hideModal}
                navigation={navigation}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    headerRight: {
        width: 40,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 25,
        marginBottom: 30,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    inputContainer: {
        marginBottom: 18,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 16,
        height: 55,
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    uploadSection: {
        marginBottom: 20,
    },
    uploadTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 10,
    },
    imageUploadContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        alignSelf: 'center',
        overflow: 'hidden',
    },
    cardUploadContainer: {
        height: 100,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    uploadPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'center',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    uploadedCardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    updateButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 20,
        elevation: 5,
        shadowColor: '#1e40af',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    updateButtonDisabled: {
        elevation: 0,
        shadowOpacity: 0,
    },
    updateButtonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 55,
    },
    updateButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
});

export default EditProfileScreen;