package com.tokbox.android.accpack.textchat;


import android.util.Log;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.UUID;

/**
 * The chat message class contains methods for the message status, sender ID and alias, the chat text, and the chat message timestamp. 
 */
public class ChatMessage {

    private static final String LOG_TAG = "text-chat-message";

    private static final int MAX_ALIAS_LENGTH = 50;
    private static final int MAX_SENDERID_LENGTH = 1000;
    private final static int MAX_TEXT_LENGTH = 8196;
    private static final int MAX_MESSAGEID_LENGTH = 36;
    private static final String RELEASE_DATE = "2016-05-01";

    private final String senderId; //required
    private final MessageStatus messageStatus; //required
    private final UUID messageId; //required
    private String senderAlias; //optional
    private String text; //optional
    private long timestamp; //optional

    /**
     * Enumerations for sent and received message status.
     */
    public static enum MessageStatus {
        /**
         * The status for a sent message.
         */
        SENT_MESSAGE,
        /**
         * The status for a received message.
         */
        RECEIVED_MESSAGE
    }

    /**
     * Private constructor.
     * @param builder The ChatMessageBuilder to creates the instance.
     * To build a ChatMessage use: new ChatMessage.ChatMessageBuild(String senderId, UUID messageId, MessageStatus messageStatus).build()
     */
    private ChatMessage(ChatMessageBuilder builder) {
        this.senderId = builder.senderId;
        this.messageId = builder.messageId;
        this.messageStatus = builder.messageStatus;
        this.text = builder.text;
        this.senderAlias = builder.senderAlias;
        this.timestamp = builder.timestamp;
    }

    /**
     * Get the sender ID.
     * @return The sender ID.
     */
    public String getSenderId() {
        return senderId;
    }

    /**
     * Get the message ID.
     * @return The message ID.
     */
    public UUID getMessageId() {
        return messageId;
    }

    /**
     * Get the message status.
     * @return The message status.
     */
    public MessageStatus getMessageStatus() {
        return messageStatus;
    }

    /**
     * Get the sender alias.
     * @return The sender alias.
     */
    public String getSenderAlias() {
        return senderAlias;
    }

    /**
     * Get the message text.
     * @return The message text.
     */
    public String getText() {
        return text;
    }

    /**
     * Get the message timestamp.
     * @return The message timestamp.
     */
    public long getTimestamp() {
        return timestamp;
    }

    /**
     * Set the message timestamp.
     * @param timestamp The message timestamp.
     */
    public void setTimestamp(long timestamp) throws Exception {

        long MIN_TIMESTAMP = new SimpleDateFormat("yyyy-MM-dd").parse(RELEASE_DATE).getTime();

        if ( timestamp < MIN_TIMESTAMP ){
            throw new Exception("Timestamp cannot be less than" + MIN_TIMESTAMP);
        }
        this.timestamp = timestamp;
    }

    /**
     * Set the sender alias.
     * @param senderAlias The sender alias.
     */
    public void setSenderAlias(String senderAlias) throws Exception {
        if ( senderAlias.length() > MAX_ALIAS_LENGTH ){
            throw new Exception("Sender alias string cannot be greater than "+MAX_ALIAS_LENGTH);
        }
        else {
            if ( senderAlias == null || senderAlias.length() == 0 || senderAlias.trim().length() == 0 ){
                throw new Exception("Sender alias cannot be null or empty");
            }
        }
        this.senderAlias = senderAlias;
    }

    /**
     * Set the message text.
     * @param text The message text.
     */
    public void setText(String text) throws Exception {
        if ( text.length() > MAX_TEXT_LENGTH ){
            throw new Exception("Text string cannot be greater than "+MAX_TEXT_LENGTH);
        }
        else {
            if ( text == null || text.length() == 0 || text.trim().length() == 0 ){
                throw new Exception("Text cannot be null or empty");
            }
        }
        this.text = text;
    }

    /**
     * ChatMessageBuilder static class used in the ChatMessage constructor to instantiate a ChatMessage.
     */
    public static class ChatMessageBuilder {

        private final String senderId;
        private final UUID messageId;
        private final MessageStatus messageStatus;
        private String senderAlias;
        private String text;
        private long timestamp;

        /**
         * Constructor.
         * @param senderId The sender ID.
         * @param messageId The message ID.
         * @param messageStatus The message status.
         */
        public ChatMessageBuilder(String senderId, UUID messageId, MessageStatus messageStatus) {
            this.senderId = senderId;
            this.messageId = messageId;
            this.messageStatus = messageStatus;
            this.timestamp = System.currentTimeMillis();
            this.senderAlias = "";
            this.text = "";
        }

        /**
         * Set a sender alias on the ChatMessage that has to be build by this ChatMessageBuilder
         * @param senderAlias The sender alias.
         */
        public ChatMessageBuilder senderAlias(String senderAlias) throws Exception {
            if ( senderAlias.length() > MAX_ALIAS_LENGTH ){
                throw new Exception("Sender alias string cannot be greater than "+MAX_ALIAS_LENGTH);
            }
            else {
                if ( senderAlias == null || senderAlias.length() == 0 || senderAlias.trim().length() == 0 ){
                    throw new Exception("Sender alias cannot be null or empty");
                }
            }
            this.senderAlias = senderAlias;
            return this;
        }

        /**
         * Set a text message string on the ChatMessage that has to be build by this ChatMessageBuilder
         * @param text The message text.
         */
        public ChatMessageBuilder text(String text) throws Exception {
            if ( text.length() > MAX_TEXT_LENGTH ){
                throw new Exception("Text string cannot be greater than "+MAX_TEXT_LENGTH);
            }
            else {
                if ( text == null || text.length() == 0 || text.trim().length() == 0 ){
                    throw new Exception("Text cannot be null or empty");
                }
            }
            this.text = text;
            return this;
        }

        /**
         * Set a timestamp on the ChatMessage that has to be build by this ChatMessageBuilder
         * @param timestamp The message timestamp.
         */
        public ChatMessageBuilder timestamp(long timestamp) throws Exception {
            long MIN_TIMESTAMP = new SimpleDateFormat("yyyy-MM-dd").parse(RELEASE_DATE).getTime();

            if ( timestamp < MIN_TIMESTAMP ){
                throw new Exception("Timestamp cannot be less than" + MIN_TIMESTAMP);
            }

            this.timestamp = timestamp;
            return this;
        }

        /**
         * Creates a new ChatMessage.
         */
        public ChatMessage build() {
            ChatMessage message = new ChatMessage(this);

            boolean valid = validateChatMessageObject(message);

            if (!valid) {
                return null;
            }

            return message;
        }

        private boolean validateChatMessageObject(ChatMessage chatMessage) {
            Log.i(LOG_TAG, "status: " + chatMessage.getMessageStatus());
            if (senderId == null || senderId.isEmpty() || senderId.length() > MAX_SENDERID_LENGTH || senderId.trim().isEmpty()) {
                Log.i(LOG_TAG, "SenderId cannot be null, empty or greater than " + MAX_SENDERID_LENGTH);
                return false;
            }
            if ( messageId == null || messageId.toString().isEmpty() || messageId.toString().length() > MAX_MESSAGEID_LENGTH || messageId.toString().trim().isEmpty()) {
                Log.i(LOG_TAG, "MessageId cannot be null, empty or greater than "+ MAX_MESSAGEID_LENGTH);
                return false;
            }
            if (chatMessage.getMessageStatus() == null || ( !chatMessage.getMessageStatus().equals(MessageStatus.RECEIVED_MESSAGE) && !chatMessage.getMessageStatus().equals(MessageStatus.SENT_MESSAGE))) {
                Log.i(LOG_TAG, "MessageStatus cannot be null or different to RECEIVED_MESSAGE or SENT_MESSAGE ");
                return false;
            }

            return true;

        }
    }


}