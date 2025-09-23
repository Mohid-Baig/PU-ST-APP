import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TextInput,
    TouchableOpacity,
    Image,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Linking,
    Keyboard,
    Alert,
    PermissionsAndroid
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import CustomModal from '../../Components/Customs/CustomModal';
import useModal from '../../Components/Customs/UseModalHook';
import instance from '../../Components/baseURL/baseURL';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        uniId: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [uniCardImage, setUniCardImage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;

    const {
        modalConfig,
        showModal,
        hideModal,
        showError,
        showSuccess,
        showConfirm,
    } = useModal();

    useEffect(() => {
        startAnimations();

        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidHideListener?.remove();
            keyboardDidShowListener?.remove();
        };
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
        const { fullName, uniId, email, password, confirmPassword } = formData;

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

        if (!password) {
            showError('Please enter a password');
            return false;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return false;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return false;
        }

        if (!profileImage) {
            showError('Please upload your profile picture');
            return false;
        }

        if (!uniCardImage) {
            showError('Please upload your university card picture');
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

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('fullName', formData.fullName);
            formDataToSend.append('uniId', formData.uniId);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('role', 'student');

            if (profileImage) {
                formDataToSend.append('profileImage', {
                    uri: profileImage.uri,
                    type: 'image/jpeg',
                    name: profileImage.fileName || 'profile.jpg'
                });
            }

            if (uniCardImage) {
                formDataToSend.append('uniCardImage', {
                    uri: uniCardImage.uri,
                    type: 'image/jpeg',
                    name: uniCardImage.fileName || 'unicard.jpg'
                });
            }

            console.log('Sending registration with images...');

            const response = await fetch('https://uni-smart-tracker.onrender.com/api/auth/register', {
                method: 'POST',
                body: formDataToSend,
                headers: {
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (response.ok) {
                showSuccess('Registration successful! Please login to continue.');
                navigation.navigate('Login');
            } else {
                showError(data.message || 'Registration failed');
            }

        } catch (error) {
            console.error('Registration error:', error);
            showError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const openPortfolio = () => {
        Linking.openURL('https://mohidbaig.vercel.app/').catch(err => {
            showError('Could not open link. Please try again later.');
        });
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

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContainer,
                        isKeyboardVisible && styles.scrollContainerKeyboard
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    <Animated.View
                        style={[
                            styles.headerContainer,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim },
                                    { scale: logoScale }
                                ]
                            }
                        ]}
                    >
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../Assets/images/puLogo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.welcomeText}>Create Account</Text>
                        <Text style={styles.subWelcomeText}>Join PU Smart Tracker community</Text>
                    </Animated.View>

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

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Icon name="lock" size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Password"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.password}
                                    onChangeText={(text) => updateFormData('password', text)}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Icon
                                        name={showPassword ? "visibility" : "visibility-off"}
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Icon name="lock-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Confirm Password"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => updateFormData('confirmPassword', text)}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Icon
                                        name={showConfirmPassword ? "visibility" : "visibility-off"}
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
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
                                    <Image
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
                                    <Image
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
                            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={isLoading ? ['#94a3b8', '#64748b'] : ['#1e40af', '#3b82f6']}
                                style={styles.registerButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <Text style={styles.registerButtonText}>Creating Account...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.registerButtonText}>Create Account</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {!isKeyboardVisible && (
                <View style={styles.footerContainer}>
                    <View style={styles.developerCredit}>
                        <Text style={styles.creditText}>Designed by </Text>
                        <Text style={styles.creditName}>Tanzeeha Baig</Text>
                        <Text style={styles.creditText}> & </Text>
                        <TouchableOpacity
                            onPress={openPortfolio}
                            style={styles.nameLink}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.creditNameLink}>Mohid Baig</Text>
                        </TouchableOpacity>
                        <Icon name="open-in-new" size={14} color="#94a3b8" style={styles.linkIcon} />
                    </View>
                </View>
            )}

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
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 80,
    },
    scrollContainerKeyboard: {
        paddingBottom: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#ffffff',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    logo: {
        width: 60,
        height: 60,
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subWelcomeText: {
        fontSize: 16,
        color: '#e2e8f0',
        textAlign: 'center',
        opacity: 0.9,
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
    eyeIcon: {
        padding: 4,
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
    registerButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#1e40af',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    registerButtonDisabled: {
        elevation: 0,
        shadowOpacity: 0,
    },
    registerButtonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 55,
    },
    registerButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
        color: '#64748b',
    },
    loginLink: {
        fontSize: 14,
        color: '#1e40af',
        fontWeight: '600',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 20,
        backgroundColor: 'rgba(30, 58, 138, 0.9)',
        alignItems: 'center',
        marginBottom: 10,
    },
    developerCredit: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    creditText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    creditName: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: '600',
    },
    nameLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    creditNameLink: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    linkIcon: {
        marginLeft: 4,
    },
});

export default RegisterScreen;