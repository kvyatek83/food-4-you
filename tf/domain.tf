resource "cloudflare_dns_record" "f4u_domain" {
  zone_id = var.cf_zone_id
  name = "@"
  type = "A"
  comment = "food-4-u Chabad Antigua"
  content = aws_instance.f4u_app_server.public_ip
  proxied = true
  ttl = 1
}
