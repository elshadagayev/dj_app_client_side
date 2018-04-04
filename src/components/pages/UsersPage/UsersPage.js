import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  Row,
  Col,
  Thumbnail,
  Button,
  Image,
  Container
} from "react-bootstrap";
import "./UsersPage.css";

class UsersPage extends Component {
  render() {
    return (
      <Grid>
        <Row>
          <Col className="r1-col1" md={5}>
            <iframe
              src="https://embed.spotify.com/?uri=spotify:user:oosabaj:playlist:2UDe8QqHAXUaLrdb0QsDGE"
              width="340"
              height="80"
              frameborder="0"
              allowtransparency="true"
            />
            <iframe
              src="https://embed.spotify.com/?uri=spotify:user:oosabaj:playlist:2UDe8QqHAXUaLrdb0QsDGE"
              width="340"
              height="80"
              frameborder="0"
              allowtransparency="true"
            />
            <iframe
              src="https://embed.spotify.com/?uri=spotify:user:oosabaj:playlist:2UDe8QqHAXUaLrdb0QsDGE"
              width="340"
              height="80"
              frameborder="0"
              allowtransparency="true"
            />
            <iframe
              src="https://embed.spotify.com/?uri=spotify:user:oosabaj:playlist:2UDe8QqHAXUaLrdb0QsDGE"
              width="340"
              height="80"
              frameborder="0"
              allowtransparency="true"
            />
            <iframe
              src="https://embed.spotify.com/?uri=spotify:user:oosabaj:playlist:2UDe8QqHAXUaLrdb0QsDGE"
              width="340"
              height="80"
              frameborder="0"
              allowtransparency="true"
            />
          </Col>
          <Col className="r1-col2" md={5}>
            <Thumbnail className="album-cover" src="assets/album-cover.jpg" />
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default UsersPage;
