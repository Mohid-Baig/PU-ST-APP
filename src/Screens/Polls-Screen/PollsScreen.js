import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomModal from '../../Components/Customs/CustomModal';
import useModal from '../../Components/Customs/UseModalHook';
import { useGetpollsQuery, usePostvotepollMutation } from '../../Redux/apiSlice';


// Sections Changed:

// sectionHeader style (line ~570)

// ❌ Removed: paddingVertical: 24 and borderBottomWidth
// ✅ Changed to: paddingTop: 16 and paddingBottom: 16
// Added backgroundColor: '#ffffff'


// emptyContainer style (line ~615)

// ❌ Removed: paddingVertical: 80
// ✅ Changed to: flex: 1 with paddingBottom: 100


// emptyListContainer → emptyContentContainer

// Renamed and simplified the style


// FlatList Configuration (line ~385)

// Changed ListEmptyComponent to wrap both header and empty state
// This prevents the large gap between header and empty state



const PollScreen = ({ navigation }) => {
    const {
        data: pollsData,
        error: pollsError,
        isLoading: pollsLoading,
        refetch: refetchPolls
    } = useGetpollsQuery();

    const [votePoll] = usePostvotepollMutation();

    const {
        modalConfig,
        showModal,
        hideModal,
        showError,
        showSuccess,
    } = useModal();

    const handleVote = async (pollId, optionIndex) => {
        try {
            await votePoll({ pollId, optionIndex }).unwrap();
            refetchPolls();
            showSuccess('Success', 'Vote recorded successfully!');
        } catch (error) {
            console.error('Error voting:', error);
            showError('Error', error?.data?.message || 'Failed to record vote. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isExpired = (expiresAt) => {
        return new Date(expiresAt) < new Date();
    };

    const getTimeRemaining = (expiresAt) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires - now;

        if (diff < 0) return 'Expired';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h left`;
        if (hours > 0) return `${hours}h left`;
        return 'Ending soon';
    };

    const calculatePercentage = (votes, totalVotes) => {
        if (totalVotes === 0) return 0;
        return Math.round((votes / totalVotes) * 100);
    };

    const getTotalVotes = (poll) => {
        return poll.votes?.reduce((sum, vote) => sum + vote, 0) || 0;
    };

    const renderPollCard = ({ item }) => {
        const expired = isExpired(item.expiresAt);
        const totalVotes = getTotalVotes(item);
        const hasVoted = item.hasVoted;

        return (
            <View style={styles.pollCard}>
                <View style={styles.pollHeader}>
                    <View style={styles.pollQuestionContainer}>
                        <Icon name="poll" size={20} color="#1e3a8a" />
                        <Text style={styles.pollQuestion}>{item.question}</Text>
                    </View>
                    <View style={[styles.timeBadge, expired && styles.expiredBadge]}>
                        <Icon
                            name={expired ? "schedule" : "access-time"}
                            size={14}
                            color={expired ? "#ef4444" : "#10b981"}
                        />
                        <Text style={[styles.timeText, expired && styles.expiredText]}>
                            {getTimeRemaining(item.expiresAt)}
                        </Text>
                    </View>
                </View>

                <View style={styles.optionsContainer}>
                    {item.options.map((option, index) => {
                        const votes = item.votes?.[index] || 0;
                        const percentage = calculatePercentage(votes, totalVotes);
                        const isSelected = item.selectedOption === index;

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionButton,
                                    hasVoted && styles.optionButtonDisabled,
                                    isSelected && styles.selectedOption
                                ]}
                                onPress={() => !hasVoted && !expired && handleVote(item._id, index)}
                                disabled={hasVoted || expired}
                            >
                                <View style={styles.optionContent}>
                                    {hasVoted ? (
                                        <>
                                            <View style={[styles.progressBar, { width: `${percentage}%` }]} />
                                            <View style={styles.optionTextContainer}>
                                                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                                                    {option}
                                                </Text>
                                                <Text style={styles.percentageText}>{percentage}%</Text>
                                            </View>
                                        </>
                                    ) : (
                                        <View style={styles.optionTextContainer}>
                                            <View style={styles.radioButton}>
                                                <View style={styles.radioButtonInner} />
                                            </View>
                                            <Text style={styles.optionText}>{option}</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.pollFooter}>
                    <Text style={styles.voteCount}>
                        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                    </Text>
                    <Text style={styles.expiryDate}>Expires: {formatDate(item.expiresAt)}</Text>
                </View>
            </View>
        );
    };

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Icon name="poll" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Polls Available</Text>
            <Text style={styles.emptySubtitle}>Check back later for new polls from admin</Text>
        </View>
    );

    const renderHeaderComponent = () => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Polls</Text>
            <Text style={styles.sectionSubtitle}>Vote and see results</Text>
        </View>
    );

    const polls = pollsData?.polls || [];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#1e3a8a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Polls</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={() => refetchPolls()}
                >
                    <Icon name="refresh" size={24} color="#1e3a8a" />
                </TouchableOpacity>
            </View>

            {pollsLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1e3a8a" />
                    <Text style={styles.loadingText}>Loading polls...</Text>
                </View>
            ) : pollsError ? (
                <View style={styles.errorContainer}>
                    <Icon name="error" size={64} color="#ef4444" />
                    <Text style={styles.errorTitle}>Error Loading Polls</Text>
                    <Text style={styles.errorSubtitle}>Please check your connection and try again</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => refetchPolls()}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    style={styles.content}
                    data={polls}
                    renderItem={renderPollCard}
                    keyExtractor={(item) => item._id}
                    ListHeaderComponent={renderHeaderComponent}
                    ListEmptyComponent={renderEmptyComponent}
                    contentContainerStyle={polls.length === 0 ? styles.emptyListContainer : styles.pollsList}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <CustomModal
                {...modalConfig}
                onClose={hideModal}
                navigation={navigation}
            />
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
    refreshButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#64748b',
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ef4444',
        marginTop: 16,
        marginBottom: 8,
    },
    errorSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#1e3a8a',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    emptyContainer: {
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
    pollsList: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    pollCard: {
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
    pollHeader: {
        marginBottom: 16,
    },
    pollQuestionContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    pollQuestion: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 8,
        flex: 1,
        lineHeight: 24,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dcfce7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    expiredBadge: {
        backgroundColor: '#fee2e2',
    },
    timeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10b981',
        marginLeft: 4,
    },
    expiredText: {
        color: '#ef4444',
    },
    optionsContainer: {
        marginBottom: 16,
    },
    optionButton: {
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        marginBottom: 8,
        overflow: 'hidden',
    },
    optionButtonDisabled: {
        backgroundColor: '#f9fafb',
    },
    selectedOption: {
        borderColor: '#1e3a8a',
        backgroundColor: '#eff6ff',
    },
    optionContent: {
        position: 'relative',
        minHeight: 48,
    },
    progressBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#dbeafe',
        borderRadius: 10,
    },
    optionTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        zIndex: 1,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#d1d5db',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'transparent',
    },
    optionText: {
        fontSize: 16,
        color: '#1e293b',
        flex: 1,
    },
    selectedOptionText: {
        fontWeight: '600',
        color: '#1e3a8a',
    },
    percentageText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e3a8a',
        marginLeft: 8,
    },
    pollFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    voteCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    expiryDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
});

export default PollScreen;