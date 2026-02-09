output "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "https://${var.frontend_subdomain}.${var.domain_name}"
}

output "api_url" {
  description = "API URL"
  value       = "https://${var.api_subdomain}.${var.domain_name}"
}

output "s3_bucket_name" {
  description = "S3 bucket name for frontend"
  value       = aws_s3_bucket.frontend.bucket
}

output "ec2_public_ip" {
  description = "EC2 public IP"
  value       = aws_eip.backend.public_ip
}

output "ec2_public_dns" {
  description = "EC2 public DNS"
  value       = aws_eip.backend.public_dns
}

output "ssh_command" {
  description = "SSH command to connect to EC2"
  value       = var.key_pair_name == "" ? "ssh -i infra/${var.project_name}-key.pem ec2-user@${aws_eip.backend.public_ip}" : "ssh -i <your-key>.pem ec2-user@${aws_eip.backend.public_ip}"
}

output "deploy_frontend" {
  description = "Commands to deploy frontend"
  value       = <<-EOT
    cd frontend && npm run build
    aws s3 sync out/ s3://${aws_s3_bucket.frontend.bucket}/ --delete
    aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.main.id} --paths '/*'
  EOT
}

output "deploy_backend" {
  description = "Commands to deploy backend"
  value       = <<-EOT
    scp -i infra/${var.project_name}-key.pem -r backend/ ec2-user@${aws_eip.backend.public_ip}:/opt/app/backend/
    ssh -i infra/${var.project_name}-key.pem ec2-user@${aws_eip.backend.public_ip} "cd /opt/app && sudo docker compose up -d --build"
  EOT
}
