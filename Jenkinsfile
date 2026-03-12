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
                            sh 'docker build -t ${DOCKER_REGISTRY}/voting-backend:${IMAGE_TAG} .'
                            sh 'docker tag ${DOCKER_REGISTRY}/voting-backend:${IMAGE_TAG} ${DOCKER_REGISTRY}/voting-backend:latest'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'docker build -t ${DOCKER_REGISTRY}/voting-frontend:${IMAGE_TAG} .'
                            sh 'docker tag ${DOCKER_REGISTRY}/voting-frontend:${IMAGE_TAG} ${DOCKER_REGISTRY}/voting-frontend:latest'
                        }
                    }
                }
            }
        }

        stage('Push Images') {
            steps {
                sh 'docker push ${DOCKER_REGISTRY}/voting-backend:${IMAGE_TAG}'
                sh 'docker push ${DOCKER_REGISTRY}/voting-backend:latest'
                sh 'docker push ${DOCKER_REGISTRY}/voting-frontend:${IMAGE_TAG}'
                sh 'docker push ${DOCKER_REGISTRY}/voting-frontend:latest'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    kubectl apply -f k8s/namespace.yaml
                    kubectl apply -f k8s/secrets.yaml
                    kubectl apply -f k8s/deployments/postgres.yaml
                    kubectl apply -f k8s/deployments/backend.yaml
                    kubectl apply -f k8s/deployments/frontend.yaml
                    kubectl set image deployment/backend backend=${DOCKER_REGISTRY}/voting-backend:${IMAGE_TAG} -n voting-app
                    kubectl set image deployment/frontend frontend=${DOCKER_REGISTRY}/voting-frontend:${IMAGE_TAG} -n voting-app
                    kubectl rollout status deployment/backend -n voting-app
                    kubectl rollout status deployment/frontend -n voting-app
                '''
            }
        }
    }

    post {
        success { echo 'Deployment successful!' }
        failure { echo 'Pipeline failed!' }
    }
}