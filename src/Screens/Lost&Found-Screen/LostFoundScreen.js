import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    Image,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Switch,
    Dimensions,
    FlatList
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomModal from '../../Components/Customs/CustomModal';
import useModal from '../../Components/Customs/UseModalHook';
import { useGetlostfoundQuery, usePostlostfoundMutation } from '../../Redux/apiSlice'

const { width } = Dimensions.get('window');

const LostAndFoundScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [items, setItems] = useState([]);
    const [myItems, setMyItems] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('lost');
    const [category, setCategory] = useState('');
    const [dateLostOrFound, setDateLostOrFound] = useState('');
    const [location, setLocation] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [collectionInfo, setCollectionInfo] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [itemImages, setItemImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    const [postLostFound] = usePostlostfoundMutation();
    const { data, error, isLoading } = useGetlostfoundQuery();

    const categories = [
        { label: 'Electronics', value: 'electronics' },
        { label: 'Clothing', value: 'clothing' },
        { label: 'Accessories', value: 'accessories' },
        { label: 'Documents', value: 'documents' },
        { label: 'Other', value: 'other' },
    ];

    const tabs = [
        { id: 'all', label: 'All Items', icon: 'list' },
        { id: 'lost', label: 'Lost', icon: 'search' },
        { id: 'found', label: 'Found', icon: 'check-circle' },
    ];

    const { modalConfig, showModal, hideModal, showError, showSuccess } = useModal();

    useEffect(() => {
        if (!isLoading && data) {
            setItems(data?.items || []);
            setMyItems(data?.items?.filter(item => item.reportedBy?.name === 'John Doe') || []);
        }
    }, [data, isLoading]);

    useEffect(() => {
        if (error) {
            console.error('API Error:', error);
            let errorMessage = 'Failed to load items. Please try again later.';

            if (error.data?.message) {
                errorMessage = error.data.message;
            } else if (error.status === 'FETCH_ERROR') {
                errorMessage = 'Network error. Please check your connection.';
            } else if (error.status === 401) {
                errorMessage = 'Unauthorized. Please login again.';
            }

            showError('Error', errorMessage);
        }
    }, [error]);

    const getFilteredItems = () => {
        switch (activeTab) {
            case 'lost':
                return items.filter(item => item.type === 'lost');
            case 'found':
                return items.filter(item => item.type === 'found');
            case 'my':
                return myItems;
            default:
                return items;
        }
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setType('lost');
        setCategory('');
        setDateLostOrFound('');
        setLocation('');
        setContactInfo('');
        setCollectionInfo('');
        setIsAnonymous(false);
        setItemImages([]);
        setShowCategoryDropdown(false);
        setShowTypeDropdown(false);
    };

    const selectImages = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            selectionLimit: 5,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel || response.error) {
                return;
            }
            if (response.assets) {
                setItemImages(response.assets);
            }
        });
    };

    const removeImage = (index) => {
        setItemImages(itemImages.filter((_, i) => i !== index));
    };

    const submitItem = async () => {
        if (!title.trim() || !description.trim() || !location.trim() || !dateLostOrFound) {
            showError('Error', 'Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('type', type);
            formData.append('category', category || 'other');
            formData.append('dateLostOrFound', dateLostOrFound);
            formData.append('location', location);
            formData.append('contactInfo', contactInfo);
            formData.append('collectionInfo', collectionInfo);
            formData.append('isAnonymous', isAnonymous);

            itemImages.forEach((image, index) => {
                formData.append('lostfoundImage', {
                    uri: image.uri,
                    type: image.type,
                    name: image.fileName || `image_${index}.jpg`,
                });
            });

            const response = await postLostFound(formData).unwrap();
            setSubmitting(false);
            setModalVisible(false);
            resetForm();
            showSuccess('Success', `${type === 'lost' ? 'Lost' : 'Found'} item posted successfully!`);
        } catch (error) {
            console.error('Submit error:', error);
            setSubmitting(false);
            let errorMessage = 'Failed to post item. Please try again.';

            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.status === 'FETCH_ERROR') {
                errorMessage = 'Network error. Please check your connection.';
            }

            showError('Error', errorMessage);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getTypeIcon = (itemType) => itemType === 'lost' ? 'search' : 'check-circle';
    const getTypeColor = (itemType) => itemType === 'lost' ? '#ef4444' : '#10b981';

    const renderTabBar = () => (
        <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Icon name={tab.icon} size={20} color={activeTab === tab.id ? '#1e3a8a' : '#64748b'} />
                        <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderItemCard = ({ item }) => (
        <TouchableOpacity
            style={styles.itemCard}
            onPress={() => navigation.navigate('ViewLostDetails', { itemDetail: item })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardCategory}>{item.category}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                    <Icon name={getTypeIcon(item.type)} size={16} color="#ffffff" />
                    <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
                </View>
            </View>

            <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
            </Text>

            <View style={styles.cardDetails}>
                <View style={styles.cardDetailRow}>
                    <Icon name="location-on" size={16} color="#64748b" />
                    <Text style={styles.cardDetailText}>{item.location}</Text>
                </View>
                <View style={styles.cardDetailRow}>
                    <Icon name="event" size={16} color="#64748b" />
                    <Text style={styles.cardDetailText}>{formatDate(item.dateLostOrFound)}</Text>
                </View>
            </View>

            {item.reportedBy && !item.isAnonymous && (
                <View style={styles.reporterInfo}>
                    <Text style={styles.reporterText}>
                        By: {item.reportedBy.name} ({item.reportedBy.uniId})
                    </Text>
                </View>
            )}

            {item.isAnonymous && (
                <View style={styles.anonymousInfo}>
                    <Text style={styles.anonymousText}>Posted anonymously</Text>
                </View>
            )}

            <View style={styles.cardFooter}>
                <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate('ViewLostDetails', { itemDetail: item })}>
                    <Text style={styles.viewButtonText}>View Details</Text>
                    <Icon name="arrow-forward-ios" size={12} color="#1e3a8a" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="search-off" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Items Found</Text>
            <Text style={styles.emptySubtitle}>
                {activeTab === 'my' ? "You haven't posted any items yet" : "No items in this category"}
            </Text>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="error-outline" size={64} color="#ef4444" />
            <Text style={styles.emptyTitle}>Failed to Load Items</Text>
            <Text style={styles.emptySubtitle}>Please check your connection and try again</Text>
            <TouchableOpacity
                style={styles.retryButton}
                onPress={() => window.location.reload()}
            >
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#1e3a8a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lost & Found</Text>
                <View style={styles.headerRight} />
            </View>

            {renderTabBar()}

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1e3a8a" />
                    <Text style={styles.loadingText}>Loading items...</Text>
                </View>
            ) : error ? (
                renderErrorState()
            ) : (
                <FlatList
                    data={getFilteredItems()}
                    renderItem={renderItemCard}
                    keyExtractor={(item) => item._id || item.id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <LinearGradient colors={['#1e3a8a', '#3b82f6']} style={styles.fabGradient}>
                    <Icon name="add" size={28} color="#ffffff" />
                </LinearGradient>
            </TouchableOpacity>

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={handleCloseModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Post Lost/Found Item</Text>
                            <TouchableOpacity onPress={handleCloseModal}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Type *</Text>
                                <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowTypeDropdown(!showTypeDropdown)}>
                                    <Text style={styles.dropdownText}>
                                        {type === 'lost' ? 'Lost Item' : 'Found Item'}
                                    </Text>
                                    <Icon name="arrow-drop-down" size={24} color="#6b7280" />
                                </TouchableOpacity>

                                {showTypeDropdown && (
                                    <View style={styles.dropdown}>
                                        <TouchableOpacity
                                            style={styles.dropdownItem}
                                            onPress={() => { setType('lost'); setShowTypeDropdown(false); }}
                                        >
                                            <Text style={styles.dropdownItemText}>Lost Item</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.dropdownItem}
                                            onPress={() => { setType('found'); setShowTypeDropdown(false); }}
                                        >
                                            <Text style={styles.dropdownItemText}>Found Item</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Title *</Text>
                                <TextInput style={styles.input} placeholder="Brief title for the item" value={title} onChangeText={setTitle} maxLength={100} />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Description *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Detailed description of the item..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    maxLength={500}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Category</Text>
                                <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                                    <Text style={[styles.dropdownText, !category && styles.placeholderText]}>
                                        {categories.find(cat => cat.value === category)?.label || 'Select category'}
                                    </Text>
                                    <Icon name="arrow-drop-down" size={24} color="#6b7280" />
                                </TouchableOpacity>

                                {showCategoryDropdown && (
                                    <View style={styles.dropdown}>
                                        {categories.map((cat) => (
                                            <TouchableOpacity
                                                key={cat.value}
                                                style={styles.dropdownItem}
                                                onPress={() => { setCategory(cat.value); setShowCategoryDropdown(false); }}
                                            >
                                                <Text style={styles.dropdownItemText}>{cat.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Date {type === 'lost' ? 'Lost' : 'Found'} *</Text>
                                <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={dateLostOrFound} onChangeText={setDateLostOrFound} />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Location *</Text>
                                <TextInput style={styles.input} placeholder="Where was it lost/found?" value={location} onChangeText={setLocation} />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Contact Info</Text>
                                <TextInput style={styles.input} placeholder="Email or phone number" value={contactInfo} onChangeText={setContactInfo} />
                            </View>

                            {type === 'found' && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Collection Info</Text>
                                    <TextInput style={styles.input} placeholder="Where can the owner collect it?" value={collectionInfo} onChangeText={setCollectionInfo} />
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <View style={styles.switchRow}>
                                    <Text style={styles.inputLabel}>Post Anonymously</Text>
                                    <Switch value={isAnonymous} onValueChange={setIsAnonymous} trackColor={{ false: '#f3f4f6', true: '#dbeafe' }} thumbColor={isAnonymous ? '#1e3a8a' : '#9ca3af'} />
                                </View>
                                <Text style={styles.switchDescription}>
                                    Your name and ID will be hidden from other users
                                </Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Photos (Optional)</Text>
                                <TouchableOpacity style={styles.imageButton} onPress={selectImages}>
                                    <Icon name="add-a-photo" size={24} color="#1e3a8a" />
                                    <Text style={styles.imageButtonText}>
                                        {itemImages.length > 0 ? `${itemImages.length} photo(s) selected` : 'Add Photos'}
                                    </Text>
                                </TouchableOpacity>

                                {itemImages.length > 0 && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreview}>
                                        {itemImages.map((image, index) => (
                                            <View key={index} style={styles.imageContainer}>
                                                <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                                                <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                                                    <Icon name="close" size={16} color="#ffffff" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>

                            <TouchableOpacity style={[styles.submitButton, submitting && styles.submitButtonDisabled]} onPress={submitItem} disabled={submitting}>
                                <LinearGradient colors={submitting ? ['#9ca3af', '#6b7280'] : ['#1e3a8a', '#3b82f6']} style={styles.submitGradient}>
                                    {submitting ? (
                                        <>
                                            <ActivityIndicator size="small" color="#ffffff" />
                                            <Text style={[styles.submitText, { marginLeft: 8 }]}>Posting...</Text>
                                        </>
                                    ) : (
                                        <Text style={styles.submitText}>Post Item</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <CustomModal {...modalConfig} onClose={hideModal} navigation={navigation} />
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e3a8a',
    },
    headerRight: {
        width: 40,
    },
    tabContainer: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    tabScrollContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
    },
    activeTab: {
        backgroundColor: '#dbeafe',
    },
    tabText: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 6,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#1e3a8a',
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
    listContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    itemCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitleContainer: {
        flex: 1,
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    cardCategory: {
        fontSize: 12,
        color: '#64748b',
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    typeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#ffffff',
        marginLeft: 4,
    },
    cardDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    cardDetails: {
        marginBottom: 12,
    },
    cardDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardDetailText: {
        fontSize: 12,
        color: '#64748b',
        marginLeft: 6,
    },
    reporterInfo: {
        backgroundColor: '#f8fafc',
        padding: 8,
        borderRadius: 8,
        marginBottom: 12,
    },
    reporterText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '500',
    },
    anonymousInfo: {
        backgroundColor: '#fef3c7',
        padding: 8,
        borderRadius: 8,
        marginBottom: 12,
    },
    anonymousText: {
        fontSize: 12,
        color: '#92400e',
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewButtonText: {
        fontSize: 14,
        color: '#1e3a8a',
        fontWeight: '500',
        marginRight: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        borderRadius: 28,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    modalForm: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1e293b',
        backgroundColor: '#ffffff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dropdownButton: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    dropdownText: {
        fontSize: 16,
        color: '#1e293b',
    },
    placeholderText: {
        color: '#9ca3af',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        marginTop: 4,
        backgroundColor: '#ffffff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#1e293b',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    switchDescription: {
        fontSize: 12,
        color: '#64748b',
        fontStyle: 'italic',
    },
    imageButton: {
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    imageButtonText: {
        fontSize: 14,
        color: '#1e3a8a',
        marginTop: 8,
        fontWeight: '500',
    },
    imagePreview: {
        marginTop: 12,
    },
    imageContainer: {
        position: 'relative',
        marginRight: 12,
    },
    selectedImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#ef4444',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    submitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
});

export default LostAndFoundScreen;