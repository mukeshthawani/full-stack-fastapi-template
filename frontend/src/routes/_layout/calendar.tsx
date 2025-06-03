import {
  Box,
  Button,
  Container,
  Heading,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import type { ApiError } from "@/client"
import { GoogleService } from "@/client/GoogleService"
import { Field } from "@/components/ui/field"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

export const Route = createFileRoute("/_layout/calendar")({
  component: CalendarPage,
})

function CalendarPage() {
  const [credentials, setCredentials] = useState("")
  const { showSuccessToast } = useCustomToast()
  const saveMutation = useMutation({
    mutationFn: GoogleService.saveCredentials,
    onSuccess: () => {
      showSuccessToast("Credentials saved")
    },
    onError: (err: ApiError) => handleError(err),
  })
  const eventsMutation = useMutation({
    mutationFn: GoogleService.getEventsNextHour,
    onError: (err: ApiError) => handleError(err),
  })

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12} mb={4}>
        Google Calendar
      </Heading>
      <VStack align="stretch" gap={4} maxW="lg">
        <Field label="Credentials JSON">
          <Textarea
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            rows={6}
          />
        </Field>
        <Button
          onClick={() => saveMutation.mutate(credentials)}
          loading={saveMutation.isPending}
        >
          Save Credentials
        </Button>
        <Button
          onClick={() => eventsMutation.mutate()}
          loading={eventsMutation.isPending}
        >
          Load Events (Next Hour)
        </Button>
        {eventsMutation.data && (
          <Box as="pre" whiteSpace="pre-wrap">
            {JSON.stringify(eventsMutation.data, null, 2)}
          </Box>
        )}
      </VStack>
    </Container>
  )
}

export default CalendarPage
