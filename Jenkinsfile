pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'localhost:5000'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Images') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            bat 'docker build -t %DOCKER_REGISTRY%/voting-backend:%IMAGE_TAG% .'
                            bat 'docker tag %DOCKER_REGISTRY%/voting-backend:%IMAGE_TAG% %DOCKER_REGISTRY%/voting-backend:latest'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            bat 'docker build -t %DOCKER_REGISTRY%/voting-frontend:%IMAGE_TAG% .'
                            bat 'docker tag %DOCKER_REGISTRY%/voting-frontend:%IMAGE_TAG% %DOCKER_REGISTRY%/voting-frontend:latest'
                        }
                    }
                }
            }
        }

        stage('Push Images') {
            steps {
                bat 'docker push %DOCKER_REGISTRY%/voting-backend:%IMAGE_TAG%'
                bat 'docker push %DOCKER_REGISTRY%/voting-backend:latest'
                bat 'docker push %DOCKER_REGISTRY%/voting-frontend:%IMAGE_TAG%'
                bat 'docker push %DOCKER_REGISTRY%/voting-frontend:latest'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat 'kubectl apply -f k8s/namespace.yaml'
                bat 'kubectl apply -f k8s/secrets.yaml'
                bat 'kubectl apply -f k8s/deployments/postgres.yaml'
                bat 'kubectl apply -f k8s/deployments/backend.yaml'
                bat 'kubectl apply -f k8s/deployments/frontend.yaml'
                bat 'kubectl set image deployment/backend backend=%DOCKER_REGISTRY%/voting-backend:%IMAGE_TAG% -n voting-app'
                bat 'kubectl set image deployment/frontend frontend=%DOCKER_REGISTRY%/voting-frontend:%IMAGE_TAG% -n voting-app'
                bat 'kubectl rollout status deployment/backend -n voting-app'
                bat 'kubectl rollout status deployment/frontend -n voting-app'
            }
        }
    }

    post {
        success { echo 'Deployment successful!' }
        failure { echo 'Pipeline failed!' }
    }
}