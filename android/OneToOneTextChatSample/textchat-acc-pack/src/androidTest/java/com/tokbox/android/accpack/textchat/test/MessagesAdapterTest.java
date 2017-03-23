package com.tokbox.android.accpack.textchat.test;

import com.tokbox.android.accpack.textchat.ChatMessage;
import com.tokbox.android.accpack.textchat.MessagesAdapter;
import com.tokbox.android.accpack.textchat.config.APIConfig;
import com.tokbox.android.accpack.textchat.testbase.TestBase;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import junit.framework.Assert;

public class MessagesAdapterTest extends TestBase {

    private List<ChatMessage> messagesList;
    private MessagesAdapter messagesAdapter;

    protected void setUp() throws Exception {
        super.setUp(APIConfig.SESSION_ID, APIConfig.TOKEN, APIConfig.API_KEY);
    }

    protected void tearDown() throws Exception {
        super.tearDown();
    }

    public void testGetItemCountWhenMessagesListIsNull()  {
        try {
            messagesAdapter = new MessagesAdapter(null);
            Assert.fail("Should have thrown an exception with null messages list");

        }catch(Exception e){
            Assert.assertNull(messagesAdapter);
        }
    }

    public void testGetItemCountWhenMessagesListIsEmpty() throws Exception {

        messagesList = new ArrayList<ChatMessage>();
        messagesAdapter = new MessagesAdapter(messagesList);

        //Item count should be zero
        Assert.assertTrue(messagesAdapter.getItemCount() == 0);

    }

     public void testGetItemCountWhenMessagesListIsNotEmpty() throws Exception {
        messagesList = new ArrayList<ChatMessage>();
        messagesList.add(new ChatMessage.ChatMessageBuilder("1",UUID.randomUUID(), ChatMessage.MessageStatus.SENT_MESSAGE).build());

        messagesAdapter = new MessagesAdapter(messagesList);

        //Item count should be greater than zero
        Assert.assertTrue(messagesAdapter.getItemCount() == 1);

    }

    public void testGetItemViewTypeWhenIndexIsZero() throws Exception {
        messagesList = new ArrayList<ChatMessage>();
        messagesList.add(new ChatMessage.ChatMessageBuilder("1",UUID.randomUUID(), ChatMessage.MessageStatus.RECEIVED_MESSAGE).build());
        messagesAdapter = new MessagesAdapter(messagesList);

        //Item View should be gotten properly
        Assert.assertNotNull(messagesAdapter.getItemViewType(0));
    }

    public void testGetItemViewType_When_IndexIsLast() throws Exception {
        messagesList = new ArrayList<ChatMessage>();
        messagesList.add(new ChatMessage.ChatMessageBuilder("1",UUID.randomUUID(), ChatMessage.MessageStatus.RECEIVED_MESSAGE).build());
        messagesList.add(new ChatMessage.ChatMessageBuilder("2",UUID.randomUUID(), ChatMessage.MessageStatus.SENT_MESSAGE).build());
        messagesList.add(new ChatMessage.ChatMessageBuilder("3",UUID.randomUUID(), ChatMessage.MessageStatus.RECEIVED_MESSAGE).build());
        messagesAdapter = new MessagesAdapter(messagesList);

        //Item View should be gotten properly
        Assert.assertNotNull(messagesAdapter.getItemViewType(2));
    }

}