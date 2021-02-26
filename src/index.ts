require('dotenv').config()

import { EventHubConsumerClient, ReceivedEventData, PartitionContext, MessagingError } from '@azure/event-hubs'

// Event Hub-compatible endpoint
// az iot hub show --query properties.eventHubEndpoints.events.endpoint --name {your IoT Hub name}
const eventHubsCompatibleEndpoint = process.env.EH_COMPATIBLE_ENDPOINT || '{YOUR_EVENT_HUB_COMPATIBLE_ENDPOINT}'

// Event Hub-compatible name
// az iot hub show --query properties.eventHubEndpoints.events.path --name {your IoT Hub name}
const eventHubsCompatiblePath = process.env.EH_COMPATIBLE_PATH || '{YOUR_EVENT_HUB_COMPATIBLE_NAME}'

// Primary key for the "service" policy to read messages
// az iot hub policy show --name service --query primaryKey --hub-name {your IoT Hub name}
const iotHubSasKey = process.env.IOTHUB_SAS_KEY || '{YOUR_IOTHUB_SAS_KEY}'

// If you have access to the Event Hub-compatible connection string from the Azure portal, then
// you can skip the Azure CLI commands above, and assign the connection string directly here.
const connectionString = `Endpoint=${eventHubsCompatibleEndpoint};EntityPath=${eventHubsCompatiblePath};SharedAccessKeyName=service;SharedAccessKey=${iotHubSasKey}`

// Display an error when Event Hub got an error
async function printError(error: Error | MessagingError, context: PartitionContext) {
  console.error('EH_ERROR:')
  console.error(error.message)
}

// Display the message content
async function printMessages(messages: ReceivedEventData[], context: PartitionContext): Promise<void> {
  for (const message of messages) {
    console.log('#######################')
    console.log('- Telementry data')
    console.log(message.body)
    console.log('----------------------')
    console.log('- Properties')
    console.log(message.properties)
    console.log('----------------------')
    console.log('- System Properties')
    console.log(message.systemProperties)
    console.log('#######################')
    console.log('')
  }
}

async function main() {
  // Create the client to connect to the default consumer group of the Event Hub
  const consumerClient = new EventHubConsumerClient('$Default', connectionString)

  console.log('--------------------')
  console.log('Read message from Device to IoT Hub is starting...')
  console.log('--------------------')
  console.log()

  // Subscribe to messages from all partitions as below
  // To subscribe to messages from a single partition, use the overload of the same method.
  consumerClient.subscribe({
    processEvents: printMessages,
    processError: printError,
  })
}

main()
  .catch((error) => {
    console.log('Error from application:', error)
  })