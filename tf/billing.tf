resource "aws_sns_topic" "billing_alert" {
  name = "billing-alert"
}

resource "aws_sns_topic_subscription" "email_subscription" {
  topic_arn = aws_sns_topic.billing_alert.arn
  protocol  = "email"
  endpoint  = var.billing_alert_email
}

resource "aws_cloudwatch_metric_alarm" "billing_alarm" {
  alarm_name          = "BillingAlarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name        = "EstimatedCharges"
  namespace          = "AWS/Billing"
  period             = "21600"  # 6 hours
  statistic          = "Maximum"
  threshold          = 5.0
  alarm_description  = "This alarm triggers when estimated charges exceed $5"
  alarm_actions      = [aws_sns_topic.billing_alert.arn]

  dimensions = {
    Currency = "USD"
  }
}