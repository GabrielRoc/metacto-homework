variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "feature-suggestions"
}

variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "key_pair_name" {
  description = "Existing EC2 key pair name. Leave empty to auto-generate."
  type        = string
  default     = ""
}

variable "db_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
  default     = "app123"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "features"
}

variable "db_user" {
  description = "PostgreSQL user"
  type        = string
  default     = "app"
}

variable "domain_name" {
  description = "Base domain name (Route53 hosted zone)"
  type        = string
  default     = "rochatecnologia.com.br"
}

variable "frontend_subdomain" {
  description = "Subdomain for frontend"
  type        = string
  default     = "feature"
}

variable "api_subdomain" {
  description = "Subdomain for backend API"
  type        = string
  default     = "api.feature"
}
