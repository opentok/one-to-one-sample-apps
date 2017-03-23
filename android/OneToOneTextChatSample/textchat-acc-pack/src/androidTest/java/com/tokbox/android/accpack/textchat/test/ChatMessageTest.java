package com.tokbox.android.accpack.textchat.test;

import com.tokbox.android.accpack.textchat.ChatMessage;
import com.tokbox.android.accpack.textchat.config.APIConfig;
import com.tokbox.android.accpack.textchat.testbase.TestBase;
import com.tokbox.android.accpack.textchat.utils.TestUtils;

import java.util.Date;
import java.util.UUID;

import junit.framework.Assert;

public class ChatMessageTest extends TestBase {

    private ChatMessage chatMessage;
    private ChatMessage.ChatMessageBuilder chatMessageBuilder;
    private String senderID;
    private UUID messageID;
    private String senderAlias;
    private String text;
    private long timestamp;
    private Date date = new Date();

    protected void setUp() throws Exception {
        super.setUp(APIConfig.SESSION_ID, APIConfig.TOKEN, APIConfig.API_KEY);
    }

    protected void tearDown() throws Exception {
        super.tearDown();
    }

    public void testChatMessageBuilderWhenOK() throws Exception {
        senderID= "1234";
        messageID = UUID.randomUUID();
        chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build(); //senderId
        chatMessage.setSenderAlias("Bob");
        chatMessage.setText("Good morning!");
        long timestamp = date.getTime();
        chatMessage.setTimestamp(timestamp);

        String errorMsg = "";

        errorMsg += chatMessage.getSenderId().equals(senderID) ? "" : "SenderID is not set properly. Expected: " + senderID + ", Actual: " + chatMessage.getSenderId() + " /n";
        errorMsg += chatMessage.getMessageId().equals(messageID) ? "" : "MessageID is not set properly. Expected: " + messageID + ", Actual: " + chatMessage.getMessageId() + " /n";
        errorMsg += chatMessage.getMessageStatus().equals(ChatMessage.MessageStatus.SENT_MESSAGE) ? "" : "MessageStatus is not set properly. Expected: " + ChatMessage.MessageStatus.RECEIVED_MESSAGE + ", Actual: " + chatMessage.getMessageStatus() + " /n";
        //Alias is set properly
        errorMsg += chatMessage.getSenderAlias().equals("Bob") ? "" : "SenderAlias is not set properly. Expected: 'Bob', Actual: " + chatMessage.getSenderAlias() + " /n";
        //Assert.assertTrue(chatMessage.getSenderAlias().equals("Bob"));
        //Message text is set properly
        errorMsg += chatMessage.getText().equals("Good morning!") ? "" : "Text is not set properly. Expected: 'Good morning!', Actual: " + chatMessage.getText() + " /n";
        //Assert.assertTrue(chatMessage.getText().equals("Good morning!"));
        //Timestamp is set properly
        errorMsg += (chatMessage.getTimestamp() == timestamp) ? "" : "TimeStamp is not set properly. Expected: NotNull, Actual: " + chatMessage.getTimestamp() + " /n";
        //Assert.assertTrue(chatMessage.getTimestamp() > 0);

        Assert.assertTrue(errorMsg,errorMsg.equals(""));
    }

    public void testChatMessageWhenOK() throws Exception {
        senderID= "1234";
        messageID = UUID.randomUUID();
        chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.RECEIVED_MESSAGE);

        chatMessageBuilder.senderAlias("Bob");
        chatMessageBuilder.text("Good morning!");
        long timestamp = date.getTime();
        chatMessageBuilder.timestamp(timestamp);

        chatMessage = chatMessageBuilder.build();

        String errorMsg = "";

        errorMsg += chatMessage.getSenderId().equals(senderID) ? "" : "SenderID is not set properly. Expected: " + senderID + ", Actual: " + chatMessage.getSenderId() + " /n";
        errorMsg += chatMessage.getMessageId().equals(messageID) ? "" : "MessageID is not set properly. Expected: " + messageID + ", Actual: " + chatMessage.getMessageId() + " /n";
        errorMsg += chatMessage.getMessageStatus().equals(ChatMessage.MessageStatus.RECEIVED_MESSAGE) ? "" : "MessageStatus is not set properly. Expected: " + ChatMessage.MessageStatus.RECEIVED_MESSAGE + ", Actual: " + chatMessage.getMessageStatus() + " /n";
        //Alias is set properly
        errorMsg += chatMessage.getSenderAlias().equals("Bob") ? "" : "SenderAlias is not set properly. Expected: 'Bob', Actual: " + chatMessage.getSenderAlias() + " /n";
        //Assert.assertTrue(chatMessage.getSenderAlias().equals("Bob"));
        //Message text is set properly
        errorMsg += chatMessage.getText().equals("Good morning!") ? "" : "Text is not set properly. Expected: 'Good morning!', Actual: " + chatMessage.getText() + " /n";
        //Assert.assertTrue(chatMessage.getText().equals("Good morning!"));
        //Timestamp is set properly
        errorMsg += (chatMessage.getTimestamp() == timestamp) ? "" : "TimeStamp is not set properly. Expected: NotNull, Actual: " + chatMessage.getTimestamp() + " /n";
        //Assert.assertTrue(chatMessage.getTimestamp() > 0);

        Assert.assertTrue(errorMsg,errorMsg.equals(""));
    }

    public void testChatMessageWhenSenderIDIsNull() throws Exception {
        senderID= null;
        messageID = UUID.randomUUID();
        chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.RECEIVED_MESSAGE);
        chatMessage = chatMessageBuilder.build();

        Assert.assertNull("Expected: Null, Actual: NotNull", chatMessage);
    }

    public void testChatMessageWhenSenderIDIsEmpty() throws Exception {
        senderID = "";
        messageID = UUID.randomUUID();
        chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.RECEIVED_MESSAGE);
        chatMessage = chatMessageBuilder.build();

        Assert.assertNull("Expected: Null, Actual: NotNull", chatMessage);
    }

    public void testChatMessageWhenSenderIDIsBlankSpace() throws Exception {
        senderID = "     ";
        messageID = UUID.randomUUID();
        chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.RECEIVED_MESSAGE).build();

        Assert.assertNull("Expected: Null, Actual: NotNull", chatMessage);

    }

    public void testChatMessageWhenSenderIDIsMAXString() throws Exception {
        senderID = TestUtils.generateString(60);
        messageID = UUID.randomUUID();
        chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
        chatMessage = chatMessageBuilder.build();

        Assert.assertTrue(chatMessage.getSenderId().equals(senderID));
    }

    public void testChatMessageWhenSenderIDIsLongString() throws Exception {
        senderID = TestUtils.generateString(1001);
        messageID = UUID.randomUUID();
        chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
        chatMessage = chatMessageBuilder.build();

        Assert.assertNull("Expected: Null, Actual: NotNull", chatMessage);
    }

    public void testChatMessageWhenMessageIDIsNull() throws Exception {
        senderID= "1234";
        messageID = null;
        chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.RECEIVED_MESSAGE);
        chatMessage = chatMessageBuilder.build();

        Assert.assertNull("Expected: Null, Actual: NotNull", chatMessage);
    }

    public void testChatMessageWhenMessageStatusIsNull() throws Exception {
        senderID= "1234";
        messageID = UUID.randomUUID();
        chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, null);
        chatMessage = chatMessageBuilder.build();

        Assert.assertNull("Expected: Null, Actual: NotNull", chatMessage);
    }

    public void testGetSenderAliasWhenSenderAliasIsNull() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build();
            chatMessage.setSenderAlias(null);

            Assert.fail("Should have thrown an exception with null sender alias");

        }catch (Exception e) {
            Assert.assertEquals(chatMessage.getSenderAlias(), "");
        }
    }

    public void testGetSenderAliasCMBWhenSenderAliasIsNull() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
            chatMessageBuilder.senderAlias(null);
            chatMessage = chatMessageBuilder.build();

            Assert.fail("Should have thrown an exception with null sender alias");

        } catch (Exception e) {
            Assert.assertNull(chatMessage);
        }
    }

    public void testGetSenderAliasWhenSenderAliasIsEmpty() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build();
            chatMessage.setSenderAlias("");

            Assert.fail("Should have thrown an exception with empty sender alias");

        } catch (Exception e) {
            Assert.assertEquals(chatMessage.getSenderAlias(), "");
        }
    }

    public void testGetSenderAliasCMBWhenSenderAliasIsEmpty() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
            chatMessageBuilder.senderAlias("");
            chatMessage = chatMessageBuilder.build();

            Assert.fail("Should have thrown an exception with empty sender alias");

        } catch (Exception e) {
            Assert.assertNull(chatMessage);
        }
    }

    public void testGetSenderAliasWhenSenderAliasIsMAXString() throws Exception {
        senderID = "1234";
        messageID = UUID.randomUUID();
        chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build();
        String senderAlias = TestUtils.generateString(50);
        chatMessage.setSenderAlias(senderAlias);

        Assert.assertTrue(chatMessage.getSenderAlias().equals(senderAlias));

    }

    public void testGetSenderAliasCMBWhenSenderAliasIsMAXString() throws Exception {
        senderID = "1234";
        messageID = UUID.randomUUID();
        chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
        String senderAlias = TestUtils.generateString(50);
        chatMessageBuilder.senderAlias(senderAlias);
        chatMessage = chatMessageBuilder.build();

        Assert.assertTrue(chatMessage.getSenderAlias().equals(senderAlias));
    }

    public void testGetSenderAliasWhenSenderAliasIsLongString() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build();
            chatMessage.setSenderAlias(TestUtils.generateString(51));

            Assert.fail("Should have thrown an exception with a long string for the sender alias");

        } catch (Exception e) {
            Assert.assertEquals(chatMessage.getSenderAlias(), "");
        }
    }

    public void testGetSenderAliasCMBWhenSenderAliasIsLongString() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
            chatMessageBuilder.senderAlias(TestUtils.generateString(51));
            chatMessage = chatMessageBuilder.build();

            Assert.fail("Should have thrown an exception with a long string for the sender alias");

        } catch (Exception e) {
            Assert.assertNull(chatMessage);
        }
    }

    public void testGetSenderAliasWhenSenderAliasIsBlankSpace() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build();
            chatMessage.setSenderAlias("     ");

            Assert.fail("Should have thrown an exception with a blank space string for the sender alias");
        } catch (Exception e) {
            Assert.assertEquals(chatMessage.getSenderAlias(), "");
        }
    }

    public void testGetSenderAliasCMBWhenSenderAliasIsBlankSpace() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
            chatMessageBuilder.senderAlias("     ");
            chatMessage = chatMessageBuilder.build();

            Assert.fail("Should have thrown an exception with a blank space string for the sender alias");
        }
        catch(Exception e){
            Assert.assertNull(chatMessage);
        }
    }

    public void testGetTextWhenTextIsNull() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build();
            chatMessage.setText(null);

            Assert.fail("Should have thrown an exception with a null string for the text message");

        } catch (Exception e) {
            Assert.assertEquals(chatMessage.getText(), "");
        }

    }

     public void testGetTextCMBWhenTextIsNull() {
         try {
             senderID = "1234";
             messageID = UUID.randomUUID();
             chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
             chatMessageBuilder.text(null);
             chatMessage = chatMessageBuilder.build();

             Assert.fail("Should have thrown an exception with a null string for the text message");

         } catch (Exception e) {
             Assert.assertNull(chatMessage);
         }
    }

    public void testGetTextWhenTextIsEmpty() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build();
            chatMessage.setText("");

            Assert.fail("Should have thrown an exception with an empty string for the text message");

        } catch (Exception e) {
            Assert.assertEquals(chatMessage.getText(), "");
        }
    }

    public void testGetTextCMBWhenTextIsEmpty() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
            chatMessageBuilder.text("");
            chatMessage = chatMessageBuilder.build();

            Assert.fail("Should have thrown an exception with an empty string for the text message");

        } catch (Exception e) {
            Assert.assertNull(chatMessage);
        }
    }

    public void testGetTextWhenTextIsMAXString() throws Exception {
        senderID = "1234";
        messageID = UUID.randomUUID();
        chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build();
        String text = TestUtils.generateString(8196);
        chatMessage.setText(text);

        Assert.assertTrue(chatMessage.getText().equals(text));
    }

    public void testGetTextCMBWhenTextIsMAXString() throws Exception {
        senderID = "1234";
        messageID = UUID.randomUUID();
        chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
        String text = TestUtils.generateString(8196);
        chatMessageBuilder.text(text);
        chatMessage = chatMessageBuilder.build();

        Assert.assertTrue(chatMessage.getText().equals(text));
    }

    public void testGetTextWhenTextIsLongString() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build();
            String text = TestUtils.generateString(8197);
            chatMessage.setText(text);

            Assert.fail("Should have thrown an exception with a long string for the text message");

        }catch(Exception e ){
            Assert.assertEquals(chatMessage.getText(), "");
        }
    }

    public void testGetTextCMBWhenTextIsLongString() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
            chatMessageBuilder.text(TestUtils.generateString(8197));
            chatMessage = chatMessageBuilder.build();

            Assert.fail("Should have thrown an exception with a long string for the text message");

        } catch (Exception e) {
            Assert.assertNull(chatMessage);
        }
    }

    public void testGetTextWhenTextIsBlankSpace() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build();
            chatMessage.setText("     ");

            Assert.fail("Should have thrown an exception with a blank space string for the text message");

        }catch(Exception e){
            Assert.assertEquals(chatMessage.getText(), "");
        }
    }

    public void testGetTextCMBWhenTextIsBlankSpace() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
            chatMessageBuilder.text("     ");
            chatMessage = chatMessageBuilder.build();

            Assert.fail("Should have thrown an exception with a blank space string for the text message");

        } catch (Exception e) {
            Assert.assertNull(chatMessage);
        }
    }

    public void testGetTimestampWhenTimestampIsMinLong() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build();
            chatMessage.setTimestamp(Long.MIN_VALUE);

            Assert.fail("Should have thrown an exception with a min long for the timestamp");

        }catch (Exception e){
            //Assert.assertNull(chatMessage.getTimestamp());
        }
    }

    public void testGetTimestampCMBWhenTimestampIsMinLong() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();

            chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
            chatMessageBuilder.timestamp(Long.MIN_VALUE);
            chatMessage = chatMessageBuilder.build();

            Assert.fail("Should have thrown an exception with a min long for the timestamp");

        } catch (Exception e) {
            Assert.assertNull(chatMessage);
        }
    }

    public void testGetTimestampWhenTimestampIsZero() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();
            chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build();
            chatMessage.setTimestamp(0);

            Assert.fail("Should have thrown an exception with timestamp equals to zero");

        }catch (Exception e ){
            //Assert.assertNull(chatMessage.getTimestamp());
        }
    }

    public void testGetTimestampCMBWhenTimestampIsZero() {
        try {
            senderID = "1234";
            messageID = UUID.randomUUID();

            chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
            chatMessageBuilder.timestamp(0);
            chatMessage = chatMessageBuilder.build();

            Assert.fail("Should have thrown an exception with timestamp equals to zero");

        }catch(Exception e){
            Assert.assertNull(chatMessage);
        }
    }
      /*

    public void testGetTimestamp_When_TimestampIsMaxLong() throws Exception {

        senderID = "1234";
        messageID = UUID.randomUUID();

        chatMessage = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE).build();

        chatMessage.setTimestamp(Long.MAX_VALUE);

    }


    public void testGetTimestampCMB_When_TimestampIsMaxLong() throws Exception {

        senderID = "1234";
        messageID = UUID.randomUUID();

        chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);
        chatMessageBuilder.timestamp(Long.MAX_VALUE);
        chatMessage = chatMessageBuilder.build();

    }

  public void testChatMessage_When_MessageIDIsEmpty() throws Exception {

      senderID= "1234";
      messageID = new UUID(0,0);
      chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.RECEIVED_MESSAGE);

      chatMessage = chatMessageBuilder.build();

      Assert.assertNull("Expected: Null, Actual: NotNull", chatMessage);
  }

  public void testChatMessage_When_MessageIDIsEmptyString() throws Exception {

      senderID= "1234";
      messageID = UUID.fromString("");
      chatMessageBuilder = new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE);

      chatMessage = chatMessageBuilder.build();

      Assert.assertNull("Expected: Null, Actual: NotNull", chatMessage);
  }

    public void testGetTimestamp_When_Null() throws Exception {

        senderID = "1234";
        messageID = UUID.randomUUID();

        chatMessage = new ChatMessage(new ChatMessage.ChatMessageBuilder(senderID, messageID, ChatMessage.MessageStatus.SENT_MESSAGE));

        //chatMessage.setTimestamp(null);

        //Timestamp
        //Assert.assertNull(chatMessage.getTimestamp());

    } */


}